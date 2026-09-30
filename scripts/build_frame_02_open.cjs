const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BRAIN_CACHE = 'C:\\Users\\mohit\\.gemini\\antigravity\\brain\\316bffc5-6aa6-4123-91e9-5677ebf23fe1';

async function buildFrame2NativeNeck() {
  const origPath = path.join(BRAIN_CACHE, 'reel2_frame02_nimbu_1790748802841.jpg');
  const { width, height } = await sharp(origPath).metadata(); // 768 x 1376

  // 1. Take the original image up to y=1050 completely intact!
  // This preserves the lemon slice, droplets, crown splash, and the open threaded glass neck rim natively!
  
  // 2. Prepare our Taazu Classic bottle body (below the neck)
  // Sized so width matches the shoulders (width = 280)
  const targetW = 280;
  // In bottle_classic_clean.png, cap was 0..95. Cut from y=120 (pure shoulder curve with cloudy drink & condensation)
  const bottleBody = await sharp(path.join(ROOT, 'scratch', 'bottle_classic_clean.png'))
    .extract({
      left: 0,
      top: 130,
      width: 312,
      height: 950 - 130
    })
    .resize({ width: targetW })
    .toBuffer();
  
  const bMeta = await sharp(bottleBody).metadata();
  const bodyLeft = Math.round((width - targetW) / 2); // 244
  const bodyTop = 1045; // Meets the glass neck right at the shoulder line!

  // 3. Popped orange cap floating open to the upper right
  const capW = 105;
  const capRaw = await sharp(path.join(ROOT, 'scratch', 'cap_extracted.png'))
    .resize({ width: capW })
    .toBuffer();
  const rotatedCap = await sharp(capRaw)
    .rotate(24, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const capMeta = await sharp(rotatedCap).metadata();
  const capLeft = 530;
  const capTop = 930;

  // 4. Inpaint the original generic bottle below y=1050 with clean studio gradient
  const rawBuf = await sharp(origPath).raw().toBuffer();
  for (let y = 1050; y < height; y++) {
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

    const leftX = 180, rightX = 588;
    for (let x = leftX; x <= rightX; x++) {
      const idx = (y * width + x) * 3;
      rawBuf[idx] = Math.round(bgR);
      rawBuf[idx+1] = Math.round(bgG);
      rawBuf[idx+2] = Math.round(bgB);
    }
  }

  const cleanedBase = await sharp(rawBuf, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();

  // 5. Dynamic golden lemon juice drops streaming directly into the bottle opening!
  // In the original image:
  // Splash crown base is at y = 955.
  // Neck rim is at y = 1005 (opening from x: 345 to 425).
  // We bridge the crown splash and the neck rim with golden drops entering the bottle opening!
  const effectsSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Golden lemon juice drop gradient -->
        <radialGradient id="juiceGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFF9C4"/>
          <stop offset="35%" stop-color="#FBC02D"/>
          <stop offset="80%" stop-color="#F57F17"/>
          <stop offset="100%" stop-color="#E65100"/>
        </radialGradient>
        <radialGradient id="hlGrad" cx="30%" cy="30%" r="40%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
        </radialGradient>
        <!-- Soft ambient drop shadow for cap -->
        <radialGradient id="capShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#6B2805" stop-opacity="0.25"/>
          <stop offset="60%" stop-color="#EA580C" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Soft Cap Shadow -->
      <ellipse cx="${capLeft + capMeta.width / 2 + 5}" cy="${capTop + capMeta.height + 15}" rx="45" ry="14" fill="url(#capShadow)"/>

      <!-- Lemon juice stream entering directly through the bottle opening -->
      <!-- Droplet 1 entering neck opening -->
      <ellipse cx="384" cy="980" rx="13" ry="18" fill="url(#juiceGrad)"/>
      <ellipse cx="380" cy="974" rx="4" ry="6" fill="url(#hlGrad)"/>

      <!-- Droplet 2 plunging inside the neck -->
      <ellipse cx="384" cy="1005" rx="16" ry="12" fill="url(#juiceGrad)"/>
      <ellipse cx="381" cy="1002" rx="6" ry="4" fill="url(#hlGrad)"/>

      <!-- Liquid level inside the opening mouth -->
      <ellipse cx="384" cy="1018" rx="35" ry="10" fill="url(#juiceGrad)" opacity="0.8"/>
      <ellipse cx="384" cy="1016" rx="22" ry="5" fill="url(#hlGrad)" opacity="0.7"/>

      <!-- Fine splash droplets bursting around the bottle mouth -->
      <circle cx="350" cy="992" r="3.5" fill="url(#juiceGrad)"/>
      <circle cx="418" cy="990" r="3.8" fill="url(#juiceGrad)"/>
      <circle cx="340" cy="978" r="2.8" fill="url(#juiceGrad)"/>
      <circle cx="428" cy="976" r="3.0" fill="url(#juiceGrad)"/>
      <circle cx="362" cy="968" r="2.2" fill="url(#juiceGrad)"/>
      <circle cx="406" cy="966" r="2.4" fill="url(#juiceGrad)"/>

      <!-- Subtle motion lines showing the popped cap -->
      <path d="M ${capLeft - 10} ${capTop + 35} Q ${capLeft - 22} ${capTop + 50} ${capLeft - 12} ${capTop + 68}" stroke="#FFF8E7" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.45"/>
      <path d="M ${capLeft + 5} ${capTop + 18} Q ${capLeft - 6} ${capTop + 30} ${capLeft + 2} ${capTop + 44}" stroke="#FFF8E7" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.35"/>
    </svg>
  `);

  const finalImg = await sharp(cleanedBase)
    .composite([
      { input: bottleBody, top: bodyTop, left: bodyLeft },
      { input: effectsSvg, top: 0, left: 0 },
      { input: rotatedCap, top: capTop, left: capLeft }
    ])
    .jpeg({ quality: 96 })
    .toFile(path.join(ROOT, 'brand-kit', 'storyboard-reel-2', 'frame-02-nimbu.jpg'));

  console.log('Frame 2 with native neck perfected:', finalImg);
}

buildFrame2NativeNeck().catch(console.error);
