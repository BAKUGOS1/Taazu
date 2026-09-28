const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildDuoProductPhoto() {
  const width = 1600;
  const height = 1200;

  // 1. Load cutouts and resize to fit nicely (height 1000px)
  const bHeight = 980;
  const b1 = await sharp('scratch/cutout1.png')
    .resize({ height: bHeight })
    .toBuffer();
  
  const b2 = await sharp('scratch/cutout2.png')
    .resize({ height: bHeight })
    .toBuffer();

  const b1Meta = await sharp(b1).metadata();
  const b2Meta = await sharp(b2).metadata();

  // Positions: left bottle and right bottle
  const b1Left = 240;
  const b2Left = 820;
  const bTop = 130;

  // 2. SVG Background with studio lighting, contact shadows, crushed ice, lemons, and rock salt
  const overlaySvg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Studio Radial Spotlight -->
    <radialGradient id="studioGlow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="50%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </radialGradient>

    <!-- Soft Contact Shadows -->
    <radialGradient id="bottleShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#431407" stop-opacity="0.65"/>
      <stop offset="45%" stop-color="#431407" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>

    <!-- Translucent Ice Cube Facet -->
    <linearGradient id="iceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#E0F2FE" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#BAE6FD" stop-opacity="0.3"/>
    </linearGradient>

    <g id="iceCrystal">
      <polygon points="0,-18 16,-6 12,18 -10,18 -18,4" fill="url(#iceGrad)" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.9"/>
      <line x1="0" y1="-18" x2="0" y2="10" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.7"/>
      <line x1="16" y1="-6" x2="-10" y2="18" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.5"/>
    </g>
  </defs>

  <!-- 1. Background Fill -->
  <rect width="${width}" height="${height}" fill="url(#studioGlow)"/>

  <!-- Floor Horizon / Ground Plane -->
  <ellipse cx="800" cy="1180" rx="950" ry="170" fill="#7C2D12" fill-opacity="0.25"/>

  <!-- 2. Contact Shadows -->
  <ellipse cx="${b1Left + b1Meta.width / 2}" cy="1075" rx="210" ry="32" fill="url(#bottleShadow)"/>
  <ellipse cx="${b2Left + b2Meta.width / 2}" cy="1075" rx="210" ry="32" fill="url(#bottleShadow)"/>
</svg>
`;

  // 3. Foreground props SVG (Crushed Ice Mound, Lemon Halves, Pink Rock Salt)
  const foregroundSvg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Translucent Ice Cube Facet -->
    <linearGradient id="iceGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#E0F2FE" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#BAE6FD" stop-opacity="0.35"/>
    </linearGradient>

    <g id="iceCrystal2">
      <polygon points="0,-20 18,-8 14,20 -10,20 -20,6" fill="url(#iceGrad2)" stroke="#FFFFFF" stroke-width="1.8" stroke-opacity="0.95"/>
      <line x1="0" y1="-20" x2="2" y2="12" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.8"/>
      <line x1="18" y1="-8" x2="-10" y2="20" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.6"/>
    </g>
  </defs>

  <!-- Crushed Ice Layer in Front of Bottles -->
  <g transform="translate(0, 1020)">
    <!-- Ice Mound Base -->
    <ellipse cx="800" cy="55" rx="550" ry="40" fill="#FFFFFF" fill-opacity="0.35"/>
    <ellipse cx="800" cy="58" rx="480" ry="28" fill="#FFFFFF" fill-opacity="0.45"/>

    <!-- Scattered Crushed Ice Cubes -->
    <use href="#iceCrystal2" x="420" y="45" transform="scale(1.3)"/>
    <use href="#iceCrystal2" x="510" y="58" transform="scale(1.7) rotate(25)"/>
    <use href="#iceCrystal2" x="610" y="38" transform="scale(1.2) rotate(-18)"/>
    <use href="#iceCrystal2" x="690" y="62" transform="scale(1.6) rotate(40)"/>
    <use href="#iceCrystal2" x="780" y="42" transform="scale(1.9) rotate(-15)"/>
    <use href="#iceCrystal2" x="870" y="56" transform="scale(1.5) rotate(32)"/>
    <use href="#iceCrystal2" x="960" y="40" transform="scale(1.8) rotate(-28)"/>
    <use href="#iceCrystal2" x="1050" y="60" transform="scale(1.4) rotate(18)"/>
    <use href="#iceCrystal2" x="1140" y="48" transform="scale(1.6) rotate(-22)"/>
  </g>

  <!-- Left Lemon Half (Photorealistic Citrus Drawing) -->
  <g transform="translate(180, 1000) scale(0.95)">
    <!-- Drop Shadow -->
    <ellipse cx="100" cy="115" rx="65" ry="16" fill="#431407" fill-opacity="0.4"/>
    <!-- Outer Rind -->
    <circle cx="100" cy="65" r="58" fill="#F5D83B" stroke="#D97706" stroke-width="2.5"/>
    <!-- White Pith -->
    <circle cx="100" cy="65" r="50" fill="#FFFBEB"/>
    <!-- Pulp Segments -->
    <circle cx="100" cy="65" r="44" fill="#FDE047"/>
    <!-- Segment Lines -->
    <line x1="100" y1="21" x2="100" y2="109" stroke="#FFFBEB" stroke-width="3"/>
    <line x1="56" y1="65" x2="144" y2="65" stroke="#FFFBEB" stroke-width="3"/>
    <line x1="69" y1="34" x2="131" y2="96" stroke="#FFFBEB" stroke-width="3"/>
    <line x1="69" y1="96" x2="131" y2="34" stroke="#FFFBEB" stroke-width="3"/>
    <!-- Juicy Center Core -->
    <circle cx="100" cy="65" r="7" fill="#FFFBEB"/>
    <circle cx="100" cy="65" r="4" fill="#FDE047"/>
  </g>

  <!-- Right Lemon Wedge & Himalayan Pink Rock Salt -->
  <g transform="translate(1200, 1020) scale(0.9)">
    <!-- Lemon Wedge Shadow -->
    <ellipse cx="110" cy="112" rx="72" ry="14" fill="#431407" fill-opacity="0.4"/>
    <!-- Lemon Wedge -->
    <path d="M 40 100 A 72 72 0 0 1 180 100 Z" fill="#F5D83B" stroke="#D97706" stroke-width="2.5"/>
    <path d="M 48 97 A 64 64 0 0 1 172 97 Z" fill="#FFFBEB"/>
    <path d="M 54 95 A 58 58 0 0 1 166 95 Z" fill="#FDE047"/>
    <line x1="110" y1="95" x2="110" y2="38" stroke="#FFFBEB" stroke-width="3"/>
    <line x1="110" y1="95" x2="68" y2="54" stroke="#FFFBEB" stroke-width="3"/>
    <line x1="110" y1="95" x2="152" y2="54" stroke="#FFFBEB" stroke-width="3"/>

    <!-- Small Pile of Himalayan Pink Rock Salt Crystals -->
    <g transform="translate(200, 48)">
      <ellipse cx="12" cy="42" rx="42" ry="10" fill="#431407" fill-opacity="0.35"/>
      <polygon points="0,-12 14,-2 10,14 -8,16 -14,4" fill="#FCA5A5" stroke="#F87171" stroke-width="1.2"/>
      <polygon points="18,-6 28,4 22,18 8,16 6,2" fill="#FECDD3" stroke="#FB7185" stroke-width="1.2"/>
      <polygon points="-16,4 -4,14 -8,26 -22,22 -24,10" fill="#F87171" stroke="#EF4444" stroke-width="1.2"/>
      <polygon points="12,14 24,22 18,34 4,30 2,18" fill="#FDA4AF" stroke="#F43F5E" stroke-width="1.2"/>
      <polygon points="-10,18 4,26 -2,38 -16,32 -18,22" fill="#FECDD3" stroke="#FB7185" stroke-width="1.2"/>
      <polygon points="26,16 34,22 30,30 20,28 18,20" fill="#FCA5A5" stroke="#F87171" stroke-width="1.2"/>
    </g>
  </g>
</svg>
`;

  // Render background
  const bgBuffer = await sharp(Buffer.from(overlaySvg)).png().toBuffer();
  const fgBuffer = await sharp(Buffer.from(foregroundSvg)).png().toBuffer();

  // Composite everything together
  const finalImage = await sharp(bgBuffer)
    .composite([
      { input: b1, left: b1Left, top: bTop },
      { input: b2, left: b2Left, top: bTop },
      { input: fgBuffer, left: 0, top: 0 }
    ])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync('brand-kit/creatives/12-both-flavours-duo.jpg', finalImage);
  fs.writeFileSync('public/creatives/12-both-flavours-duo.jpg', finalImage);

  // Also write PNG
  await sharp(finalImage).png().toFile('brand-kit/creatives/12-both-flavours-duo.png');
  await sharp(finalImage).png().toFile('public/creatives/12-both-flavours-duo.png');

  console.log('Successfully generated 12-both-flavours-duo.jpg and .png (1600x1200, 4K crisp)!');
}

buildDuoProductPhoto();
