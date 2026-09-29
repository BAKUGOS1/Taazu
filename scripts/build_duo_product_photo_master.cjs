const sharp = require('sharp');
const fs = require('fs');

async function buildDuoProductPhotoMaster() {
  const width = 1600;
  const height = 1200;

  console.log('1. Preparing precisely trimmed bottle cutouts...');
  const b1Trimmed = await sharp('scratch/test_cutout1.png').trim().toBuffer();
  const b2Trimmed = await sharp('scratch/test_cutout2.png').trim().toBuffer();

  const targetHeight = 880;
  const b1 = await sharp(b1Trimmed).resize({ height: targetHeight }).toBuffer();
  const b2 = await sharp(b2Trimmed).resize({ height: targetHeight }).toBuffer();

  const b1Meta = await sharp(b1).metadata();
  const b2Meta = await sharp(b2).metadata();

  // Position:
  // Bottles top at y = 110, bottom lands exactly at baseY = 990
  const bTop = 110;
  const baseY = bTop + targetHeight; // 990

  // Spacing: companion duo pair centered at 570 and 1030 (460px center distance)
  const b1Left = Math.round(570 - b1Meta.width / 2);
  const b2Left = Math.round(1030 - b2Meta.width / 2);

  const b1CenterX = b1Left + Math.round(b1Meta.width / 2);
  const b2CenterX = b2Left + Math.round(b2Meta.width / 2);

  console.log(`Bottle 1: center ${b1CenterX}, left ${b1Left}, base ${baseY}`);
  console.log(`Bottle 2: center ${b2CenterX}, left ${b2Left}, base ${baseY}`);

  // 2. Prepare photographic lemon props
  console.log('2. Preparing lemon props...');
  const lemonScaleW = 210;
  const lemonLeft = await sharp('scratch/lemon_prop_final.png')
    .resize({ width: lemonScaleW })
    .toBuffer();

  const lemonRight = await sharp('scratch/lemon_prop_final.png')
    .flop()
    .resize({ width: Math.round(lemonScaleW * 0.92) })
    .toBuffer();

  const lemonLeftMeta = await sharp(lemonLeft).metadata();
  const lemonRightMeta = await sharp(lemonRight).metadata();

  // Nestled beside bottle bases
  const lemonLeftX = 280;
  const lemonLeftY = baseY - lemonLeftMeta.height + 25;

  const lemonRightX = 1120;
  const lemonRightY = baseY - lemonRightMeta.height + 25;

  // 3. LAYER 1: Background & Contact Shadows SVG
  console.log('3. Building seamless orange studio background & rear ice layer...');
  const bgSvg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Radiant Studio Sweep Spotlight -->
    <radialGradient id="studioSweep" cx="50%" cy="36%" r="65%">
      <stop offset="0%" stop-color="#FFA24C"/>
      <stop offset="30%" stop-color="#FB923C"/>
      <stop offset="65%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#9A300C"/>
    </radialGradient>

    <!-- Studio Floor Soft Radial Occlusion -->
    <radialGradient id="floorWarmth" cx="50%" cy="92%" r="65%">
      <stop offset="0%" stop-color="#6C2408" stop-opacity="0.32"/>
      <stop offset="50%" stop-color="#6C2408" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>

    <!-- Deep Ambient Occlusion Shadow directly under bottle base ring -->
    <radialGradient id="baseAo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#220601" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#3B1104" stop-opacity="0.6"/>
      <stop offset="75%" stop-color="#6C2408" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>

    <!-- Soft Directional Floor Shadow -->
    <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B1104" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#6C2408" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>

    <!-- Ice Bed Mound Gradient (Soft translucent frost mound behind bottles) -->
    <radialGradient id="iceMoundGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#FED7AA" stop-opacity="0.5"/>
      <stop offset="85%" stop-color="#EA580C" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- 1. Seamless Studio Cyclorama Fill -->
  <rect width="${width}" height="${height}" fill="url(#studioSweep)"/>
  <rect width="${width}" height="${height}" fill="url(#floorWarmth)"/>

  <!-- 2. Realistic Contact Shadows directly under bottles -->
  <!-- Left Bottle -->
  <ellipse cx="${b1CenterX}" cy="${baseY + 8}" rx="170" ry="32" fill="url(#floorShadow)"/>
  <ellipse cx="${b1CenterX}" cy="${baseY + 2}" rx="120" ry="15" fill="url(#baseAo)"/>

  <!-- Right Bottle -->
  <ellipse cx="${b2CenterX}" cy="${baseY + 8}" rx="170" ry="32" fill="url(#floorShadow)"/>
  <ellipse cx="${b2CenterX}" cy="${baseY + 2}" rx="120" ry="15" fill="url(#baseAo)"/>

  <!-- Lemon Props Shadows -->
  <ellipse cx="${lemonLeftX + lemonScaleW * 0.45}" cy="${lemonLeftY + lemonLeftMeta.height - 4}" rx="80" ry="16" fill="url(#floorShadow)"/>
  <ellipse cx="${lemonRightX + lemonRightMeta.width * 0.5}" cy="${lemonRightY + lemonRightMeta.height - 4}" rx="80" ry="16" fill="url(#floorShadow)"/>

  <!-- 3. Rear Ice Mound (Behind bottles) -->
  <ellipse cx="800" cy="${baseY}" rx="540" ry="36" fill="url(#iceMoundGrad)"/>
</svg>
`;

  // 4. LAYER 2: Foreground Props (Ice Chunks Hugging Bases + Pink Salt Pile)
  console.log('4. Generating foreground crushed ice and pink rock salt...');
  let seed = 334455;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // Ice chunks cluster hugging bases (y: baseY - 35 to baseY + 35)
  const iceChunks = [];
  for (let i = 0; i < 200; i++) {
    let cx, cy, size;
    const r = rand();
    if (r < 0.40) {
      // Snug around left bottle base
      cx = b1CenterX + (rand() - 0.5) * 310;
      cy = baseY + (rand() - 0.45) * 55;
    } else if (r < 0.80) {
      // Snug around right bottle base
      cx = b2CenterX + (rand() - 0.5) * 310;
      cy = baseY + (rand() - 0.45) * 55;
    } else {
      // Center connecting bed
      cx = 800 + (rand() - 0.5) * 260;
      cy = baseY + (rand() - 0.3) * 45;
    }
    size = 12 + rand() * 26;
    iceChunks.push({ cx, cy, size, z: cy });
  }
  iceChunks.sort((a, b) => a.z - b.z);

  let iceSvgChunks = '';
  for (const c of iceChunks) {
    const s = c.size;
    const numPts = 5 + Math.floor(rand() * 3);
    const pts = [];
    for (let p = 0; p < numPts; p++) {
      const angle = (p / numPts) * Math.PI * 2 + (rand() - 0.5) * 0.4;
      const rad = (s * 0.5) * (0.7 + rand() * 0.6);
      pts.push({
        x: c.cx + Math.cos(angle) * rad,
        y: c.cy + Math.sin(angle) * (rad * 0.68)
      });
    }
    const polyStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const centerPt = {
      x: c.cx + (rand() - 0.5) * s * 0.25,
      y: c.cy + (rand() - 0.5) * s * 0.2
    };

    let internalLines = '';
    for (let p = 0; p < pts.length; p++) {
      if (rand() > 0.36) {
        internalLines += `<line x1="${pts[p].x.toFixed(1)}" y1="${pts[p].y.toFixed(1)}" x2="${centerPt.x.toFixed(1)}" y2="${centerPt.y.toFixed(1)}" stroke="#FFFFFF" stroke-width="${(0.7 + rand() * 0.7).toFixed(1)}" stroke-opacity="${(0.55 + rand() * 0.4).toFixed(2)}"/>`;
      }
    }

    let glint = '';
    if (rand() > 0.42) {
      const gPt = pts[Math.floor(rand() * pts.length)];
      glint = `<circle cx="${gPt.x.toFixed(1)}" cy="${gPt.y.toFixed(1)}" r="${(1.1 + rand() * 1.5).toFixed(1)}" fill="#FFFFFF" opacity="0.95"/>`;
    }

    iceSvgChunks += `
      <polygon points="${polyStr}" fill="url(#iceFacetGrad)" stroke="#FFFFFF" stroke-width="1.1" stroke-opacity="0.9"/>
      ${internalLines}
      ${glint}
    `;
  }

  // Micro glints (fine shaved ice granules)
  let microGlints = '';
  for (let m = 0; m < 380; m++) {
    const mx = 270 + rand() * 1060;
    const my = baseY - 28 + rand() * 70;
    const mr = 0.8 + rand() * 1.8;
    const mop = 0.45 + rand() * 0.55;
    microGlints += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${mr.toFixed(1)}" fill="#FFFFFF" opacity="${mop.toFixed(2)}"/>`;
  }

  // Himalayan Pink Rock Salt Mound (nestled near right bottle base at x = 1060, y = baseY + 8)
  const saltX = 1060;
  const saltY = baseY + 8;
  const saltCrystals = [
    { dx: 0, dy: 0, s: 18, rot: 15, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { dx: -14, dy: 5, s: 15, rot: -30, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
    { dx: 14, dy: 4, s: 16, rot: 45, col: '#FB7185', light: '#FFE4E6', dark: '#BE123C' },
    { dx: -24, dy: 10, s: 13, rot: 10, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { dx: 22, dy: 9, s: 14, rot: -20, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
    { dx: -6, dy: 12, s: 20, rot: 35, col: '#F43F5E', light: '#FFE4E6', dark: '#BE123C' },
    { dx: 10, dy: 13, s: 16, rot: -15, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { dx: -18, dy: 16, s: 12, rot: 60, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
    { dx: 20, dy: 17, s: 13, rot: -40, col: '#FB7185', light: '#FFE4E6', dark: '#BE123C' },
    { dx: -2, dy: 19, s: 16, rot: 5, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { dx: 14, dy: 21, s: 14, rot: 25, col: '#F43F5E', light: '#FFE4E6', dark: '#BE123C' },
    { dx: -12, dy: 22, s: 11, rot: -50, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
    { dx: 28, dy: 15, s: 9, rot: 15, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { dx: -28, dy: 13, s: 8, rot: -25, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
    { dx: 4, dy: 24, s: 11, rot: 40, col: '#FB7185', light: '#FFE4E6', dark: '#BE123C' },
  ];

  let saltSvg = `
    <ellipse cx="${saltX}" cy="${saltY + 18}" rx="46" ry="14" fill="url(#saltShadow)"/>
  `;
  for (const sc of saltCrystals) {
    const s = sc.s;
    const px = saltX + sc.dx;
    const py = saltY + sc.dy;
    saltSvg += `
      <g transform="translate(${px}, ${py}) rotate(${sc.rot})">
        <polygon points="0,${-s*0.55} ${s*0.65},${-s*0.18} ${s*0.48},${s*0.55} ${-s*0.38},${s*0.65} ${-s*0.65},${s*0.1}" fill="${sc.col}" stroke="${sc.dark}" stroke-width="1.0" opacity="0.95"/>
        <polygon points="0,${-s*0.55} ${s*0.65},${-s*0.18} ${s*0.1},${-s*0.05} ${-s*0.28},${-s*0.18}" fill="${sc.light}" opacity="0.85"/>
        <line x1="0" y1="${-s*0.55}" x2="${s*0.65}" y2="${-s*0.18}" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    `;
  }

  const fgSvg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Translucent Ice Prism Gradient with Studio Orange Internal Bounce -->
    <linearGradient id="iceFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="40%" stop-color="#F8FAFC" stop-opacity="0.75"/>
      <stop offset="70%" stop-color="#FED7AA" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0.25"/>
    </linearGradient>

    <!-- Floor shadow under salt pile -->
    <radialGradient id="saltShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B1104" stop-opacity="0.6"/>
      <stop offset="60%" stop-color="#6C2408" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Crushed Ice Chunks hugging and partially overlapping base of bottles -->
  <g id="foreground-ice">
    ${iceSvgChunks}
    ${microGlints}
  </g>

  <!-- Himalayan Pink Rock Salt -->
  <g id="pink-rock-salt">
    ${saltSvg}
  </g>

  <!-- Floor Water Sheen / Droplet reflections -->
  <ellipse cx="${b1CenterX}" cy="${baseY + 16}" rx="110" ry="10" fill="#FFFFFF" fill-opacity="0.14"/>
  <ellipse cx="${b2CenterX}" cy="${baseY + 16}" rx="110" ry="10" fill="#FFFFFF" fill-opacity="0.14"/>
</svg>
`;

  console.log('5. Rendering raster layers...');
  const bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const fgBuffer = await sharp(Buffer.from(fgSvg)).png().toBuffer();

  console.log('6. Assembling final composite with proper Z-index...');
  const finalImage = await sharp(bgBuffer)
    .composite([
      // Z=1: Left Bottle (Classic Nimbu Namak)
      { input: b1, left: b1Left, top: bTop },
      // Z=2: Right Bottle (Jeera Masala)
      { input: b2, left: b2Left, top: bTop },
      // Z=3: Left Lemon Prop (Photographic lemon half & slice with mint)
      { input: lemonLeft, left: lemonLeftX, top: lemonLeftY },
      // Z=4: Right Lemon Prop (Photographic lemon half mirrored)
      { input: lemonRight, left: lemonRightX, top: lemonRightY },
      // Z=5: Foreground Crushed Ice & Pink Salt (hugging and interlocking with base)
      { input: fgBuffer, left: 0, top: 0 }
    ])
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  const outJpg1 = 'brand-kit/creatives/bottle-renders/12-both-flavours-duo.jpg';
  const outPng1 = 'brand-kit/creatives/bottle-renders/12-both-flavours-duo.png';
  const pubJpg1 = 'public/creatives/bottle-renders/12-both-flavours-duo.jpg';
  const pubPng1 = 'public/creatives/bottle-renders/12-both-flavours-duo.png';

  fs.writeFileSync(outJpg1, finalImage);
  fs.writeFileSync(pubJpg1, finalImage);

  await sharp(finalImage).png({ compressionLevel: 8 }).toFile(outPng1);
  await sharp(finalImage).png({ compressionLevel: 8 }).toFile(pubPng1);

  console.log(`Successfully generated:\n- ${outJpg1}\n- ${outPng1}\n- ${pubJpg1}\n- ${pubPng1}`);
}

buildDuoProductPhotoMaster().catch(console.error);
