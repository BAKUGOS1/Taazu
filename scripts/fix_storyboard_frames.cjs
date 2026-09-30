const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BRAIN_CACHE = 'C:\\Users\\mohit\\.gemini\\antigravity\\brain\\316bffc5-6aa6-4123-91e9-5677ebf23fe1';
const FRAMES_DIR = path.join(ROOT, 'brand-kit', 'storyboard-reel-2');

async function processFrame8() {
  console.log('--- Processing Frame 8: Splash (Clean Mirror & Blend) ---');
  const origPath = path.join(BRAIN_CACHE, 'reel2_frame08_splash_1790748899940.jpg');
  const { width, height } = await sharp(origPath).metadata(); // 768 x 1376

  const rawBuf = await sharp(origPath).raw().toBuffer();

  // 1. Inpaint center drop: smooth cosine interpolation between left and right background
  for (let y = 415; y <= 695; y++) {
    const leftX = 275;
    const rightX = 475;
    const leftIdx = (y * width + leftX) * 3;
    const rightIdx = (y * width + rightX) * 3;

    const r0 = rawBuf[leftIdx], g0 = rawBuf[leftIdx + 1], b0 = rawBuf[leftIdx + 2];
    const r1 = rawBuf[rightIdx], g1 = rawBuf[rightIdx + 1], b1 = rawBuf[rightIdx + 2];

    for (let x = leftX + 1; x < rightX; x++) {
      const t = (x - leftX) / (rightX - leftX);
      const s = 0.5 - 0.5 * Math.cos(t * Math.PI);
      const idx = (y * width + x) * 3;
      rawBuf[idx] = Math.round(r0 + (r1 - r0) * s);
      rawBuf[idx + 1] = Math.round(g0 + (g1 - g0) * s);
      rawBuf[idx + 2] = Math.round(b0 + (b1 - b0) * s);
    }
  }

  // 2. Clean right bottle area (x: 580 to 767, y: 720 to 1250)
  // The left side of the scene (x: 0 to 187) has the exact same lighting & wet floor texture.
  // We mirror x: 0..187 into x: 580..767 with a smooth cross-fade blend from x: 575..595
  for (let y = 720; y <= 1260; y++) {
    for (let x = 580; x < width; x++) {
      const srcX = width - 1 - x; // Mirrored from left side (0 to 187)
      const srcIdx = (y * width + srcX) * 3;
      const dstIdx = (y * width + x) * 3;

      const rSrc = rawBuf[srcIdx], gSrc = rawBuf[srcIdx + 1], bSrc = rawBuf[srcIdx + 2];

      if (x < 600) {
        // Smooth cross-fade transition zone (580 to 600)
        const t = (x - 580) / 20;
        const s = 0.5 - 0.5 * Math.cos(t * Math.PI);
        rawBuf[dstIdx] = Math.round(rawBuf[dstIdx] * (1 - s) + rSrc * s);
        rawBuf[dstIdx + 1] = Math.round(rawBuf[dstIdx + 1] * (1 - s) + gSrc * s);
        rawBuf[dstIdx + 2] = Math.round(rawBuf[dstIdx + 2] * (1 - s) + bSrc * s);
      } else {
        rawBuf[dstIdx] = rSrc;
        rawBuf[dstIdx + 1] = gSrc;
        rawBuf[dstIdx + 2] = bSrc;
      }
    }
  }

  const cleanedBase = await sharp(rawBuf, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();

  // 3. Taazu Logo Drop in center
  const dropW = 145;
  const logoDrop = await sharp(path.join(ROOT, 'brand-kit', 'labels', 'assets', 'taazu-logo-icon-c2-transparent.png'))
    .resize({ width: dropW })
    .toBuffer();
  const dropMeta = await sharp(logoDrop).metadata();
  const dropLeft = Math.round((width - dropMeta.width) / 2);
  const dropTop = Math.round(550 - dropMeta.height / 2);

  // 4. Taazu Bottle on right
  const bottleW = 104;
  const bottle = await sharp(path.join(ROOT, 'scratch', 'bottle_classic_clean.png'))
    .resize({ width: bottleW })
    .toBuffer();
  const bMeta = await sharp(bottle).metadata();
  const bottleLeft = 624;
  const bottleTop = 770;
  const bottleBase = bottleTop + bMeta.height; // ~ 1087

  // Floor reflection
  const reflHeight = 110;
  const bottleRefl = await sharp(bottle)
    .flip()
    .resize({ width: bottleW, height: reflHeight, fit: 'fill' })
    .blur(1.8)
    .toBuffer();

  const effectsSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dropGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFE873" stop-opacity="0.6"/>
          <stop offset="45%" stop-color="#EA580C" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="bShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.85"/>
          <stop offset="60%" stop-color="#000000" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${width / 2}" cy="${dropTop + dropMeta.height / 2}" rx="${dropW * 0.95}" ry="${dropMeta.height * 0.7}" fill="url(#dropGlow)"/>
      <ellipse cx="${bottleLeft + bMeta.width / 2}" cy="${bottleBase}" rx="${bottleW * 0.55}" ry="12" fill="url(#bShadow)"/>
    </svg>
  `);

  const reflMaskSvg = Buffer.from(`
    <svg width="${bottleW}" height="${reflHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.38"/>
          <stop offset="60%" stop-color="#ffffff" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${bottleW}" height="${reflHeight}" fill="url(#fade)"/>
    </svg>
  `);
  const maskedRefl = await sharp(bottleRefl)
    .composite([{ input: reflMaskSvg, blend: 'dest-in' }])
    .toBuffer();

  const finalBuf = await sharp(cleanedBase)
    .composite([
      { input: effectsSvg, top: 0, left: 0 },
      { input: maskedRefl, top: bottleBase, left: bottleLeft },
      { input: bottle, top: bottleTop, left: bottleLeft },
      { input: logoDrop, top: dropTop, left: dropLeft }
    ])
    .jpeg({ quality: 96 })
    .toBuffer();

  const destPath = path.join(FRAMES_DIR, 'frame-08-splash.jpg');
  fs.writeFileSync(destPath, finalBuf);
  console.log('Frame 8 pristine update complete.');
}

async function processFrame2() {
  console.log('--- Processing Frame 2: NIMBU (Seamless Studio Gradient) ---');
  const origPath = path.join(BRAIN_CACHE, 'reel2_frame02_nimbu_1790748802841.jpg');
  const { width, height } = await sharp(origPath).metadata(); // 768 x 1376

  const rawBuf = await sharp(origPath).raw().toBuffer();

  // The background from y: 720 to 1375 is a clean vertical gradient.
  // Sample left margin (x: 40..80) and right margin (x: 688..728) to compute Bg(y)
  for (let y = 720; y < height; y++) {
    // Average left and right samples
    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    for (let dx = 40; dx <= 80; dx++) {
      const idx = (y * width + dx) * 3;
      sumR += rawBuf[idx]; sumG += rawBuf[idx+1]; sumB += rawBuf[idx+2];
      count++;
    }
    for (let dx = 688; dx <= 728; dx++) {
      const idx = (y * width + dx) * 3;
      sumR += rawBuf[idx]; sumG += rawBuf[idx+1]; sumB += rawBuf[idx+2];
      count++;
    }
    const bgR = sumR / count;
    const bgG = sumG / count;
    const bgB = sumB / count;

    // Smoothly replace center region (x: 180 to 588) with the clean studio gradient
    const leftX = 180, rightX = 588;
    for (let x = leftX; x <= rightX; x++) {
      const idx = (y * width + x) * 3;
      // Edge cross-fade
      let blend = 1.0;
      if (x < leftX + 40) {
        const t = (x - leftX) / 40;
        blend = 0.5 - 0.5 * Math.cos(t * Math.PI);
      } else if (x > rightX - 40) {
        const t = (rightX - x) / 40;
        blend = 0.5 - 0.5 * Math.cos(t * Math.PI);
      }
      rawBuf[idx] = Math.round(rawBuf[idx] * (1 - blend) + bgR * blend);
      rawBuf[idx+1] = Math.round(rawBuf[idx+1] * (1 - blend) + bgG * blend);
      rawBuf[idx+2] = Math.round(rawBuf[idx+2] * (1 - blend) + bgB * blend);
    }
  }

  const cleanedBase = await sharp(rawBuf, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();

  // Bottle size & placement
  // In Frame 2, lemon slice is at center top.
  // The bottle cap sits at y = 715, label runs down to 1376
  const bottleW = 280;
  const bottle = await sharp(path.join(ROOT, 'scratch', 'bottle_classic_clean.png'))
    .resize({ width: bottleW })
    .toBuffer();
  const bMeta = await sharp(bottle).metadata();
  const bottleLeft = Math.round((width - bMeta.width) / 2);
  const bottleTop = 715;

  const glowSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bottleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#F5D83B" stop-opacity="0.35"/>
          <stop offset="60%" stop-color="#EA580C" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${width / 2}" cy="${bottleTop + 180}" rx="280" ry="320" fill="url(#bottleGlow)"/>
    </svg>
  `);

  const finalBuf = await sharp(cleanedBase)
    .composite([
      { input: glowSvg, top: 0, left: 0 },
      { input: bottle, top: bottleTop, left: bottleLeft }
    ])
    .jpeg({ quality: 96 })
    .toBuffer();

  const destPath = path.join(FRAMES_DIR, 'frame-02-nimbu.jpg');
  fs.writeFileSync(destPath, finalBuf);
  console.log('Frame 2 pristine update complete.');
}

async function processFrame6() {
  console.log('--- Processing Frame 6: Thanda (Icy Bottle Integration) ---');
  const origPath = path.join(BRAIN_CACHE, 'reel2_frame06_thanda_1790748871418.jpg');
  const { width, height } = await sharp(origPath).metadata(); // 768 x 1376

  const rawBuf = await sharp(origPath).raw().toBuffer();

  // Inpaint the old bottle neck & top background on right (x: 605..767, y: 0..380)
  // Background at x: 550..605 has clean icy bokeh. We smoothly extend it to the right margin
  for (let y = 0; y <= 380; y++) {
    const srcX = 585;
    const srcIdx = (y * width + srcX) * 3;
    const r = rawBuf[srcIdx], g = rawBuf[srcIdx+1], b = rawBuf[srcIdx+2];

    for (let x = 605; x < width; x++) {
      const idx = (y * width + x) * 3;
      const t = (x - 605) / (width - 605);
      const falloff = 1.0 - t * 0.05;
      rawBuf[idx] = Math.round(r * falloff);
      rawBuf[idx+1] = Math.round(g * falloff);
      rawBuf[idx+2] = Math.round(b * falloff);
    }
  }

  // Also clean the dark table surface (y: 1100..1375, x: 605..767)
  for (let y = 1100; y < height; y++) {
    const srcX = 585;
    const srcIdx = (y * width + srcX) * 3;
    const r = rawBuf[srcIdx], g = rawBuf[srcIdx+1], b = rawBuf[srcIdx+2];
    for (let x = 605; x < width; x++) {
      const idx = (y * width + x) * 3;
      rawBuf[idx] = r;
      rawBuf[idx+1] = g;
      rawBuf[idx+2] = b;
    }
  }

  const cleanedBase = await sharp(rawBuf, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();

  // Position Taazu Classic bottle on right
  const bottleH = 880;
  const bottle = await sharp(path.join(ROOT, 'scratch', 'bottle_classic_clean.png'))
    .resize({ height: bottleH })
    .toBuffer();
  const bMeta = await sharp(bottle).metadata();
  const bottleLeft = 620;
  const bottleTop = 270;
  const bottleBase = bottleTop + bMeta.height; // ~ 1150

  // Shadow on table
  const shadowSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coldShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0a121e" stop-opacity="0.9"/>
          <stop offset="65%" stop-color="#0a121e" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#0a121e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${bottleLeft + bMeta.width / 2}" cy="${bottleBase}" rx="${bMeta.width * 0.6}" ry="16" fill="url(#coldShadow)"/>
    </svg>
  `);

  // Table reflection
  const reflHeight = 120;
  const bottleRefl = await sharp(bottle)
    .flip()
    .resize({ width: bMeta.width, height: reflHeight, fit: 'fill' })
    .blur(2)
    .toBuffer();

  const reflMaskSvg = Buffer.from(`
    <svg width="${bMeta.width}" height="${reflHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
          <stop offset="60%" stop-color="#ffffff" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${bMeta.width}" height="${reflHeight}" fill="url(#reflFade)"/>
    </svg>
  `);
  const maskedRefl = await sharp(bottleRefl)
    .composite([{ input: reflMaskSvg, blend: 'dest-in' }])
    .toBuffer();

  const finalBuf = await sharp(cleanedBase)
    .composite([
      { input: shadowSvg, top: 0, left: 0 },
      { input: maskedRefl, top: bottleBase, left: bottleLeft },
      { input: bottle, top: bottleTop, left: bottleLeft }
    ])
    .jpeg({ quality: 96 })
    .toBuffer();

  const destPath = path.join(FRAMES_DIR, 'frame-06-thanda.jpg');
  fs.writeFileSync(destPath, finalBuf);
  console.log('Frame 6 pristine update complete.');
}

async function main() {
  await processFrame8();
  await processFrame2();
  await processFrame6();
  console.log('All 3 frames completed with studio-grade polish!');
}

main().catch(console.error);
