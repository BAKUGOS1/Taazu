const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BRAIN_CACHE = 'C:\\Users\\mohit\\.gemini\\antigravity\\brain\\316bffc5-6aa6-4123-91e9-5677ebf23fe1';
const FRAMES_DIR = path.join(ROOT, 'brand-kit', 'storyboard-reel-2');

async function processFrame2Clean() {
  console.log('--- Refining Frame 2: NIMBU ---');
  const origPath = path.join(BRAIN_CACHE, 'reel2_frame02_nimbu_1790748802841.jpg');
  const { width, height } = await sharp(origPath).metadata();

  const rawBuf = await sharp(origPath).raw().toBuffer();

  // Clean studio background fill behind the bottle:
  // Instead of a sharp line at y=720, we calculate a clean radial/linear background
  // and smoothly blend it starting from y=660 down to 1375.
  for (let y = 660; y < height; y++) {
    // Sample left margin (x: 40..100) and right margin (x: 668..728)
    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    for (let dx = 40; dx <= 100; dx++) {
      const idx = (y * width + dx) * 3;
      sumR += rawBuf[idx]; sumG += rawBuf[idx+1]; sumB += rawBuf[idx+2];
      count++;
    }
    for (let dx = 668; dx <= 728; dx++) {
      const idx = (y * width + dx) * 3;
      sumR += rawBuf[idx]; sumG += rawBuf[idx+1]; sumB += rawBuf[idx+2];
      count++;
    }
    const bgR = sumR / count;
    const bgG = sumG / count;
    const bgB = sumB / count;

    // Vertical blend factor (0 at y=660, 1 at y=720)
    let vBlend = 1.0;
    if (y < 720) {
      const ty = (y - 660) / 60;
      vBlend = 0.5 - 0.5 * Math.cos(ty * Math.PI);
    }

    const leftX = 180, rightX = 588;
    for (let x = leftX; x <= rightX; x++) {
      const idx = (y * width + x) * 3;
      let hBlend = 1.0;
      if (x < leftX + 50) {
        const tx = (x - leftX) / 50;
        hBlend = 0.5 - 0.5 * Math.cos(tx * Math.PI);
      } else if (x > rightX - 50) {
        const tx = (rightX - x) / 50;
        hBlend = 0.5 - 0.5 * Math.cos(tx * Math.PI);
      }
      const totalBlend = vBlend * hBlend;
      rawBuf[idx] = Math.round(rawBuf[idx] * (1 - totalBlend) + bgR * totalBlend);
      rawBuf[idx+1] = Math.round(rawBuf[idx+1] * (1 - totalBlend) + bgG * totalBlend);
      rawBuf[idx+2] = Math.round(rawBuf[idx+2] * (1 - totalBlend) + bgB * totalBlend);
    }
  }

  const cleanedBase = await sharp(rawBuf, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();

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
          <stop offset="0%" stop-color="#F5D83B" stop-opacity="0.3"/>
          <stop offset="60%" stop-color="#EA580C" stop-opacity="0.12"/>
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

  fs.writeFileSync(path.join(FRAMES_DIR, 'frame-02-nimbu.jpg'), finalBuf);
  console.log('Frame 2 refined successfully.');
}

async function processFrame6Clean() {
  console.log('--- Refining Frame 6: Thanda ---');
  const origPath = path.join(BRAIN_CACHE, 'reel2_frame06_thanda_1790748871418.jpg');
  const { width, height } = await sharp(origPath).metadata();

  const rawBuf = await sharp(origPath).raw().toBuffer();

  // In Frame 6, we ONLY need to cover the old bottle neck at the top right:
  // x: 640..740, y: 50..340
  // Background at x: 40..200, y: 50..340 has pure icy blue bokeh texture!
  // We can clone a soft patch from x: 120..220, y: 50..340 and blend it over the old neck
  for (let y = 40; y <= 350; y++) {
    for (let x = 620; x < width; x++) {
      // Source patch from left bokeh (x: 100 to 248)
      const srcX = 100 + (x - 620);
      const srcIdx = (y * width + srcX) * 3;
      const dstIdx = (y * width + x) * 3;

      const rSrc = rawBuf[srcIdx], gSrc = rawBuf[srcIdx+1], bSrc = rawBuf[srcIdx+2];

      // Soft feather mask on edges (x: 620..645 and y: 40..70 and y: 320..350)
      let mask = 1.0;
      if (x < 650) mask *= (x - 620) / 30;
      if (y < 70) mask *= (y - 40) / 30;
      if (y > 320) mask *= (350 - y) / 30;

      rawBuf[dstIdx] = Math.round(rawBuf[dstIdx] * (1 - mask) + rSrc * mask);
      rawBuf[dstIdx+1] = Math.round(rawBuf[dstIdx+1] * (1 - mask) + gSrc * mask);
      rawBuf[dstIdx+2] = Math.round(rawBuf[dstIdx+2] * (1 - mask) + bSrc * mask);
    }
  }

  // Notice: The original table at the bottom (y: 1050 to 1375) is ALREADY the authentic dark counter!
  // We do NOT smear or overwrite it; we keep the real table intact!

  const cleanedBase = await sharp(rawBuf, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();

  // Composite our Taazu Classic bottle
  const bottleH = 880;
  const bottle = await sharp(path.join(ROOT, 'scratch', 'bottle_classic_clean.png'))
    .resize({ height: bottleH })
    .toBuffer();
  const bMeta = await sharp(bottle).metadata();
  const bottleLeft = 620;
  const bottleTop = 270;
  const bottleBase = bottleTop + bMeta.height; // ~ 1150

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

  // Reflection on table
  const reflHeight = 120;
  const bottleRefl = await sharp(bottle)
    .flip()
    .resize({ width: bMeta.width, height: reflHeight, fit: 'fill' })
    .blur(2.2)
    .toBuffer();

  const reflMaskSvg = Buffer.from(`
    <svg width="${bMeta.width}" height="${reflHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
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

  fs.writeFileSync(path.join(FRAMES_DIR, 'frame-06-thanda.jpg'), finalBuf);
  console.log('Frame 6 refined successfully.');
}

async function main() {
  await processFrame2Clean();
  await processFrame6Clean();
}

main().catch(console.error);
