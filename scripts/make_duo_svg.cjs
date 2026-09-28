const fs = require('fs');
const path = require('path');

const img1Path = path.resolve('brand-kit/creatives/09-hero-bottle-a1.jpg');
const img2Path = path.resolve('brand-kit/creatives/11-jeera-masala-a2.jpg');

const b1 = fs.readFileSync(img1Path).toString('base64');
const b2 = fs.readFileSync(img2Path).toString('base64');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" width="1600" height="1200">
  <defs>
    <!-- Background Radial Studio Lighting -->
    <radialGradient id="studioGlow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="45%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </radialGradient>

    <!-- Floor shadow gradient -->
    <radialGradient id="dropShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7C2D12" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#7C2D12" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#7C2D12" stop-opacity="0"/>
    </radialGradient>

    <!-- Soft bottle clip mask (rounded bottle silhouette) -->
    <clipPath id="bottleClip">
      <!-- Cap & neck -->
      <rect x="290" y="115" width="316" height="135" rx="20"/>
      <!-- Shoulders, waist, and body -->
      <path d="M 290 230 C 240 280, 225 360, 225 430 L 225 980 C 225 1035, 270 1065, 340 1065 L 556 1065 C 626 1065, 671 1035, 671 980 L 671 430 C 671 360, 656 280, 606 230 Z"/>
    </clipPath>

    <!-- Ice Crystal Defs -->
    <polygon id="iceCube" points="0,-16 14,-6 10,14 -8,16 -16,4" fill="#FFFFFF" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1.5"/>
  </defs>

  <!-- 1. SOLID VIBRANT ORANGE STUDIO BACKGROUND -->
  <rect width="1600" height="1200" fill="url(#studioGlow)"/>

  <!-- Subtle Studio Floor Horizon Line -->
  <ellipse cx="800" cy="1150" rx="900" ry="160" fill="#7C2D12" fill-opacity="0.22"/>

  <!-- 2. CONTACT SHADOWS FOR BOTH BOTTLES -->
  <ellipse cx="500" cy="1040" rx="220" ry="40" fill="url(#dropShadow)"/>
  <ellipse cx="1100" cy="1040" rx="220" ry="40" fill="url(#dropShadow)"/>

  <!-- 3. LEFT BOTTLE: CLASSIC NIMBU NAMAK -->
  <g transform="translate(50, -10)">
    <!-- Base cream glow to seamlessly feather edges -->
    <ellipse cx="448" cy="1025" rx="190" ry="25" fill="#FFF8E7" fill-opacity="0.3"/>
    <g clip-path="url(#bottleClip)">
      <image href="data:image/jpeg;base64,${b1}" x="0" y="0" width="896" height="1200" preserveAspectRatio="xMidYMid slice"/>
    </g>
  </g>

  <!-- 4. RIGHT BOTTLE: JEERA MASALA -->
  <g transform="translate(650, -10)">
    <ellipse cx="448" cy="1025" rx="190" ry="25" fill="#FFF8E7" fill-opacity="0.3"/>
    <g clip-path="url(#bottleClip)">
      <image href="data:image/jpeg;base64,${b2}" x="0" y="0" width="896" height="1200" preserveAspectRatio="xMidYMid slice"/>
    </g>
  </g>

  <!-- 5. CRUSHED ICE BED AT BASE -->
  <g transform="translate(0, 970)">
    <!-- Base Ice Mound -->
    <ellipse cx="800" cy="55" rx="640" ry="42" fill="#FFFFFF" fill-opacity="0.35"/>
    <ellipse cx="800" cy="55" rx="580" ry="32" fill="#FFFFFF" fill-opacity="0.5"/>

    <!-- Ice Crystal Facets -->
    <use href="#iceCube" x="380" y="45" transform="scale(1.4)"/>
    <use href="#iceCube" x="460" y="55" transform="scale(1.8) rotate(24)"/>
    <use href="#iceCube" x="540" y="40" transform="scale(1.2) rotate(-18)"/>
    <use href="#iceCube" x="620" y="60" transform="scale(1.6) rotate(42)"/>
    <use href="#iceCube" x="710" y="38" transform="scale(1.3) rotate(-32)"/>
    <use href="#iceCube" x="780" y="52" transform="scale(2.0) rotate(12)"/>
    <use href="#iceCube" x="870" y="44" transform="scale(1.5) rotate(-22)"/>
    <use href="#iceCube" x="960" y="58" transform="scale(1.7) rotate(35)"/>
    <use href="#iceCube" x="1050" y="42" transform="scale(1.3) rotate(-14)"/>
    <use href="#iceCube" x="1140" y="50" transform="scale(1.6) rotate(20)"/>
    <use href="#iceCube" x="1220" y="46" transform="scale(1.2) rotate(-40)"/>
  </g>

  <!-- 6. FRESH LEMON HALVES & PINK ROCK SALT PROPS -->
  <!-- Left Lemon Half -->
  <g transform="translate(260, 990) scale(0.75)">
    <!-- Outer yellow rind -->
    <circle cx="100" cy="60" r="62" fill="#F5D83B" stroke="#EA580C" stroke-width="2"/>
    <!-- Pith -->
    <circle cx="100" cy="60" r="54" fill="#FFF8E7"/>
    <!-- Pulp -->
    <circle cx="100" cy="60" r="48" fill="#FDE047"/>
    <!-- Segments -->
    <line x1="100" y1="12" x2="100" y2="108" stroke="#FFF8E7" stroke-width="3"/>
    <line x1="52" y1="60" x2="148" y2="60" stroke="#FFF8E7" stroke-width="3"/>
    <line x1="66" y1="26" x2="134" y2="94" stroke="#FFF8E7" stroke-width="3"/>
    <line x1="66" y1="94" x2="134" y2="26" stroke="#FFF8E7" stroke-width="3"/>
    <!-- Drop shadow under lemon -->
    <ellipse cx="100" cy="115" rx="60" ry="14" fill="#7C2D12" fill-opacity="0.35"/>
  </g>

  <!-- Right Lemon Slice & Pink Rock Salt -->
  <g transform="translate(1220, 1005) scale(0.65)">
    <!-- Lemon wedge -->
    <path d="M 50 100 A 70 70 0 0 1 190 100 Z" fill="#F5D83B" stroke="#EA580C" stroke-width="2"/>
    <path d="M 58 97 A 62 62 0 0 1 182 97 Z" fill="#FFF8E7"/>
    <path d="M 64 95 A 56 56 0 0 1 176 95 Z" fill="#FDE047"/>
    <line x1="120" y1="95" x2="120" y2="40" stroke="#FFF8E7" stroke-width="3"/>
    <line x1="120" y1="95" x2="80" y2="55" stroke="#FFF8E7" stroke-width="3"/>
    <line x1="120" y1="95" x2="160" y2="55" stroke="#FFF8E7" stroke-width="3"/>
    <ellipse cx="120" cy="110" rx="68" ry="12" fill="#7C2D12" fill-opacity="0.35"/>

    <!-- Small pile of Pink Rock Salt -->
    <g transform="translate(210, 45)">
      <polygon points="0,-10 12,-2 8,12 -6,14 -12,4" fill="#FCA5A5" stroke="#F87171" stroke-width="1"/>
      <polygon points="16,-4 26,4 20,16 6,14 4,2" fill="#FECDD3" stroke="#F43F5E" stroke-width="1"/>
      <polygon points="-14,4 -4,12 -8,22 -20,18 -22,8" fill="#F87171" stroke="#EF4444" stroke-width="1"/>
      <polygon points="10,14 20,20 16,30 2,28 0,18" fill="#FCA5A5" stroke="#F87171" stroke-width="1"/>
      <polygon points="-8,18 2,24 -2,34 -14,30 -16,22" fill="#FECDD3" stroke="#F43F5E" stroke-width="1"/>
      <ellipse cx="5" cy="38" rx="35" ry="8" fill="#7C2D12" fill-opacity="0.3"/>
    </g>
  </g>

  <!-- 7. BRAND HEADER WATERMARK (Clean & Premium) -->
  <g transform="translate(800, 75)" text-anchor="middle">
    <text font-family="'Baloo Bhai 2', 'Arial Black', sans-serif" font-weight="800" font-size="38" fill="#FFF8E7" letter-spacing="4">TAAZU</text>
    <text y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="14" fill="#FED7AA" letter-spacing="3">STILL LEMON-SALT ELECTROLYTE • 250 ML</text>
  </g>
</svg>
`;

fs.writeFileSync('brand-kit/creatives/12-both-flavours-duo.svg', svg);
fs.writeFileSync('public/creatives/12-both-flavours-duo.svg', svg);
console.log('Successfully created 12-both-flavours-duo.svg in brand-kit and public!');
