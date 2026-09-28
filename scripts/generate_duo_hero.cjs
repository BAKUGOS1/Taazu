const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function extractPristineCutouts() {
  console.log('Extracting pristine bottle cutouts...');
  const { data: d1, info: i1 } = await sharp('brand-kit/creatives/09-hero-bottle-a1.jpg').raw().toBuffer({ resolveWithObject: true });
  const { data: d2, info: i2 } = await sharp('brand-kit/creatives/11-jeera-masala-a2.jpg').raw().toBuffer({ resolveWithObject: true });
  
  const isBg = (data, info, x, y) => {
    if (x < 0 || x >= info.width || y < 0 || y >= info.height) return true;
    const idx = (y * info.width + x) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    return (Math.abs(r - 245) + Math.abs(g - 238) + Math.abs(b - 215)) < 35;
  };

  const hwMap = new Map();
  for (let y = 154; y <= 1103; y++) {
    let halfWidth = 0;
    if (y < 1000) {
      for (let x = 448; x < i1.width; x++) {
        if (!isBg(d1, i1, x, y)) halfWidth = x - 448;
      }
    } else {
      for (let x = 100; x <= 448; x++) {
        if (!isBg(d1, i1, x, y)) {
          halfWidth = 448 - x;
          break;
        }
      }
    }
    hwMap.set(y, halfWidth);
  }

  // Helper to build RGBA buffer
  function buildCutout(data, info) {
    const rgba = Buffer.alloc(info.width * info.height * 4);
    for (let y = 0; y < info.height; y++) {
      const hw = hwMap.get(y) || 0;
      for (let x = 0; x < info.width; x++) {
        const srcIdx = (y * info.width + x) * 3;
        const dstIdx = (y * info.width + x) * 4;
        rgba[dstIdx] = data[srcIdx];
        rgba[dstIdx + 1] = data[srcIdx + 1];
        rgba[dstIdx + 2] = data[srcIdx + 2];

        const dx = Math.abs(x - 448.5);
        const edge = hw - 0.7; // slight erosion to guarantee 0 cream fringe
        if (hw === 0 || dx > edge + 1.2) {
          rgba[dstIdx + 3] = 0;
        } else if (dx < edge - 1.2) {
          rgba[dstIdx + 3] = 255;
        } else {
          const t = (edge + 1.2 - dx) / 2.4;
          rgba[dstIdx + 3] = Math.round(t * 255);
        }
      }
    }
    return rgba;
  }

  const buf1 = await sharp(buildCutout(d1, i1), { raw: { width: i1.width, height: i1.height, channels: 4 } }).png().toBuffer();
  const buf2 = await sharp(buildCutout(d2, i2), { raw: { width: i2.width, height: i2.height, channels: 4 } }).png().toBuffer();

  return { buf1, buf2 };
}

// Procedural high-detail Lemon Half SVG
function generateLemonHalfSvg(radius = 80, angleDeg = 15) {
  const segs = 10;
  let segPaths = '';
  const innerR = radius * 0.88;
  const pulpR = radius * 0.82;
  const coreR = radius * 0.16;

  for (let i = 0; i < segs; i++) {
    const a1 = (i / segs) * Math.PI * 2 + 0.05;
    const a2 = ((i + 1) / segs) * Math.PI * 2 - 0.05;
    const midA = (a1 + a2) / 2;

    const x1 = Math.cos(a1) * (coreR + 3);
    const y1 = Math.sin(a1) * (coreR + 3);
    const x2 = Math.cos(a1) * pulpR;
    const y2 = Math.sin(a1) * pulpR;
    const x3 = Math.cos(a2) * pulpR;
    const y3 = Math.sin(a2) * pulpR;
    const x4 = Math.cos(a2) * (coreR + 3);
    const y4 = Math.sin(a2) * (coreR + 3);

    // Juice vesicle texture glints inside segment
    const vx1 = Math.cos(midA) * (pulpR * 0.6);
    const vy1 = Math.sin(midA) * (pulpR * 0.6);
    const vx2 = Math.cos(midA + 0.08) * (pulpR * 0.8);
    const vy2 = Math.sin(midA + 0.08) * (pulpR * 0.8);

    segPaths += `
      <!-- Segment ${i} -->
      <path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} A ${pulpR.toFixed(1)} ${pulpR.toFixed(1)} 0 0 1 ${x3.toFixed(1)} ${y3.toFixed(1)} L ${x4.toFixed(1)} ${y4.toFixed(1)} Z" fill="url(#pulpGrad)" stroke="#FEF9C3" stroke-width="1.5"/>
      <ellipse cx="${vx1.toFixed(1)}" cy="${vy1.toFixed(1)}" rx="${(radius * 0.07).toFixed(1)}" ry="${(radius * 0.035).toFixed(1)}" transform="rotate(${(midA*180/Math.PI).toFixed(1)} ${vx1.toFixed(1)} ${vy1.toFixed(1)})" fill="#FEF08A" opacity="0.85"/>
      <ellipse cx="${vx2.toFixed(1)}" cy="${vy2.toFixed(1)}" rx="${(radius * 0.05).toFixed(1)}" ry="${(radius * 0.025).toFixed(1)}" transform="rotate(${(midA*180/Math.PI).toFixed(1)} ${vx2.toFixed(1)} ${vy2.toFixed(1)})" fill="#FFFFFF" opacity="0.75"/>
    `;
  }

  return `
    <g transform="rotate(${angleDeg})">
      <!-- Rind Shadow -->
      <circle cx="0" cy="0" r="${radius + 2}" fill="#CA8A04"/>
      <!-- Outer Zest / Rind -->
      <circle cx="0" cy="0" r="${radius}" fill="url(#lemonRindGrad)"/>
      <!-- White Pith -->
      <circle cx="0" cy="0" r="${innerR.toFixed(1)}" fill="url(#pithGrad)"/>
      <!-- Pulp Segments -->
      ${segPaths}
      <!-- Central Core Pith -->
      <circle cx="0" cy="0" r="${coreR.toFixed(1)}" fill="#FFFBEB"/>
      <circle cx="0" cy="0" r="${(coreR * 0.5).toFixed(1)}" fill="#FEF08A"/>
      <!-- Wet Surface Sheen -->
      <ellipse cx="${(-radius * 0.25).toFixed(1)}" cy="${(-radius * 0.3).toFixed(1)}" rx="${(radius * 0.4).toFixed(1)}" ry="${(radius * 0.2).toFixed(1)}" transform="rotate(-30 ${(-radius * 0.25).toFixed(1)} ${(-radius * 0.3).toFixed(1)})" fill="#FFFFFF" opacity="0.32"/>
    </g>
  `;
}

// Procedural high-detail Lemon Wedge SVG
function generateLemonWedgeSvg(radius = 80, angleDeg = -20) {
  const innerR = radius * 0.88;
  const pulpR = radius * 0.82;
  const segs = 5;
  let segPaths = '';

  for (let i = 0; i < segs; i++) {
    const a1 = (i / segs) * Math.PI + 0.06;
    const a2 = ((i + 1) / segs) * Math.PI - 0.06;
    const midA = (a1 + a2) / 2;

    const x1 = Math.cos(a1) * 8;
    const y1 = Math.sin(a1) * 8;
    const x2 = Math.cos(a1) * pulpR;
    const y2 = Math.sin(a1) * pulpR;
    const x3 = Math.cos(a2) * pulpR;
    const y3 = Math.sin(a2) * pulpR;
    const x4 = Math.cos(a2) * 8;
    const y4 = Math.sin(a2) * 8;

    const vx1 = Math.cos(midA) * (pulpR * 0.6);
    const vy1 = Math.sin(midA) * (pulpR * 0.6);

    segPaths += `
      <path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} A ${pulpR.toFixed(1)} ${pulpR.toFixed(1)} 0 0 1 ${x3.toFixed(1)} ${y3.toFixed(1)} L ${x4.toFixed(1)} ${y4.toFixed(1)} Z" fill="url(#pulpGrad)" stroke="#FEF9C3" stroke-width="1.4"/>
      <ellipse cx="${vx1.toFixed(1)}" cy="${vy1.toFixed(1)}" rx="${(radius * 0.06).toFixed(1)}" ry="${(radius * 0.03).toFixed(1)}" transform="rotate(${(midA*180/Math.PI).toFixed(1)} ${vx1.toFixed(1)} ${vy1.toFixed(1)})" fill="#FFFFFF" opacity="0.7"/>
    `;
  }

  return `
    <g transform="rotate(${angleDeg})">
      <!-- Curved Rind -->
      <path d="M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0 Z" fill="url(#lemonRindGrad)" stroke="#CA8A04" stroke-width="2"/>
      <!-- Pith Layer -->
      <path d="M ${-innerR.toFixed(1)} 0 A ${innerR.toFixed(1)} ${innerR.toFixed(1)} 0 0 1 ${innerR.toFixed(1)} 0 Z" fill="url(#pithGrad)"/>
      <!-- Segments -->
      ${segPaths}
      <!-- Straight Back Edge Pith Line -->
      <rect x="${-innerR.toFixed(1)}" y="-2" width="${(innerR * 2).toFixed(1)}" height="5" fill="#FFFBEB"/>
      <!-- Wet Sheen -->
      <ellipse cx="0" cy="${(radius * 0.35).toFixed(1)}" rx="${(radius * 0.45).toFixed(1)}" ry="${(radius * 0.15).toFixed(1)}" fill="#FFFFFF" opacity="0.3"/>
    </g>
  `;
}

// Procedural Salt Crystal Pile
function generatePinkSaltPile(count = 24) {
  const crystals = [
    { x: 0, y: 0, s: 22, rot: 15, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { x: -18, y: 8, s: 18, rot: -30, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
    { x: 16, y: 6, s: 20, rot: 45, col: '#F43F5E', light: '#FFE4E6', dark: '#BE123C' },
    { x: -32, y: 14, s: 15, rot: 10, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { x: 28, y: 12, s: 16, rot: -20, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
    { x: -8, y: 18, s: 24, rot: 35, col: '#FB7185', light: '#FFE4E6', dark: '#BE123C' },
    { x: 12, y: 20, s: 19, rot: -15, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { x: -24, y: 24, s: 14, rot: 60, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
    { x: 26, y: 26, s: 15, rot: -40, col: '#F43F5E', light: '#FFE4E6', dark: '#BE123C' },
    { x: -4, y: 30, s: 20, rot: 5, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { x: 18, y: 32, s: 16, rot: 25, col: '#FB7185', light: '#FFE4E6', dark: '#BE123C' },
    { x: -16, y: 34, s: 13, rot: -50, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
    { x: 38, y: 22, s: 11, rot: 15, col: '#FDA4AF', light: '#FFF1F2', dark: '#E11D48' },
    { x: -40, y: 20, s: 10, rot: -25, col: '#FECDD3', light: '#FFFFFF', dark: '#F43F5E' },
  ];

  let out = '';
  for (const c of crystals) {
    const s = c.s;
    out += `
      <g transform="translate(${c.x}, ${c.y}) rotate(${c.rot})">
        <!-- Crystal Body -->
        <polygon points="0,${-s*0.6} ${s*0.7},${-s*0.2} ${s*0.5},${s*0.6} ${-s*0.4},${s*0.7} ${-s*0.7},${s*0.1}" fill="${c.col}" stroke="${c.dark}" stroke-width="1.2" opacity="0.95"/>
        <!-- Top Light Facet -->
        <polygon points="0,${-s*0.6} ${s*0.7},${-s*0.2} ${s*0.1},${-s*0.05} ${-s*0.3},${-s*0.2}" fill="${c.light}" opacity="0.8"/>
        <!-- Specular Highlight Line -->
        <line x1="0" y1="${-s*0.6}" x2="${s*0.7}" y2="${-s*0.2}" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
      </g>
    `;
  }
  return out;
}

// Procedural Crushed Ice Field
function generateCrushedIceField(width, centerY = 1005) {
  // Array of ice shard definitions
  const iceCubes = [
    // Background layer (behind bottles or snug around bases)
    { x: 380, y: centerY - 25, s: 38, rot: 12, op: 0.7 },
    { x: 460, y: centerY - 15, s: 44, rot: -25, op: 0.8 },
    { x: 550, y: centerY - 30, s: 35, rot: 40, op: 0.75 },
    { x: 630, y: centerY - 10, s: 48, rot: -15, op: 0.85 },
    { x: 720, y: centerY - 20, s: 42, rot: 30, op: 0.8 },
    { x: 800, y: centerY - 28, s: 50, rot: -8, op: 0.85 },
    { x: 880, y: centerY - 14, s: 45, rot: 22, op: 0.8 },
    { x: 970, y: centerY - 24, s: 39, rot: -35, op: 0.75 },
    { x: 1060, y: centerY - 12, s: 46, rot: 18, op: 0.85 },
    { x: 1140, y: centerY - 22, s: 40, rot: -20, op: 0.75 },
    { x: 1220, y: centerY - 15, s: 36, rot: 15, op: 0.7 },

    // Mid/Foreground layer (in front of bases)
    { x: 340, y: centerY + 15, s: 42, rot: 35, op: 0.9 },
    { x: 420, y: centerY + 25, s: 52, rot: -18, op: 0.95 },
    { x: 500, y: centerY + 18, s: 48, rot: 28, op: 0.92 },
    { x: 590, y: centerY + 30, s: 56, rot: -42, op: 0.95 },
    { x: 670, y: centerY + 22, s: 50, rot: 14, op: 0.92 },
    { x: 750, y: centerY + 32, s: 58, rot: -12, op: 0.96 },
    { x: 830, y: centerY + 20, s: 54, rot: 26, op: 0.94 },
    { x: 920, y: centerY + 34, s: 52, rot: -28, op: 0.95 },
    { x: 1010, y: centerY + 22, s: 50, rot: 32, op: 0.93 },
    { x: 1100, y: centerY + 28, s: 54, rot: -16, op: 0.95 },
    { x: 1180, y: centerY + 16, s: 44, rot: 20, op: 0.9 },
    { x: 1260, y: centerY + 24, s: 38, rot: -30, op: 0.85 },

    // Scattering smaller crushed shards
    { x: 450, y: centerY + 45, s: 24, rot: 50, op: 0.9 },
    { x: 540, y: centerY + 48, s: 28, rot: -22, op: 0.92 },
    { x: 630, y: centerY + 50, s: 30, rot: 15, op: 0.94 },
    { x: 720, y: centerY + 52, s: 26, rot: -38, op: 0.9 },
    { x: 810, y: centerY + 48, s: 32, rot: 44, op: 0.95 },
    { x: 900, y: centerY + 52, s: 27, rot: -14, op: 0.92 },
    { x: 990, y: centerY + 46, s: 29, rot: 33, op: 0.93 },
    { x: 1080, y: centerY + 48, s: 25, rot: -25, op: 0.9 }
  ];

  let out = '';
  for (const c of iceCubes) {
    const s = c.s;
    out += `
      <g transform="translate(${c.x}, ${c.y}) rotate(${c.rot})" opacity="${c.op}">
        <!-- Soft ice contact shadow -->
        <ellipse cx="0" cy="${s*0.4}" rx="${s*0.6}" ry="${s*0.18}" fill="#431407" opacity="0.32"/>
        <!-- Main Translucent Facet -->
        <polygon points="0,${-s*0.5} ${s*0.55},${-s*0.2} ${s*0.45},${s*0.45} ${-s*0.35},${s*0.5} ${-s*0.55},${s*0.15}" fill="url(#iceCrystalGrad)" stroke="#FFFFFF" stroke-width="1.8" stroke-opacity="0.95"/>
        <!-- Internal Refractive Edges -->
        <line x1="0" y1="${-s*0.5}" x2="${s*0.1}" y2="${s*0.2}" stroke="#FFFFFF" stroke-width="1.4" stroke-opacity="0.8"/>
        <line x1="${s*0.55}" y1="${-s*0.2}" x2="${s*0.1}" y2="${s*0.2}" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.7"/>
        <line x1="${-s*0.55}" y1="${s*0.15}" x2="${s*0.1}" y2="${s*0.2}" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.6"/>
        <line x1="${-s*0.35}" y1="${s*0.5}" x2="${s*0.1}" y2="${s*0.2}" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.6"/>
        <!-- Glint Highlight -->
        <circle cx="${s*0.1}" cy="${-s*0.3}" r="${s*0.08}" fill="#FFFFFF" opacity="0.9"/>
      </g>
    `;
  }
  return out;
}

async function buildDuoMasterpiece() {
  const width = 1600;
  const height = 1200;

  const { buf1, buf2 } = await extractPristineCutouts();

  // Bottle target height: 960px (proportional, majestic hero scale)
  const bHeight = 950;
  const b1Resized = await sharp(buf1).resize({ height: bHeight }).toBuffer();
  const b2Resized = await sharp(buf2).resize({ height: bHeight }).toBuffer();

  const b1Meta = await sharp(b1Resized).metadata();
  const b2Meta = await sharp(b2Resized).metadata();

  // Bottle horizontal placement (center of bottles at x=530 and x=1070)
  const b1Left = Math.round(530 - b1Meta.width / 2);
  const b2Left = Math.round(1070 - b2Meta.width / 2);
  const bTop = 75; // Cap starts at y ~ 75, base lands at y ~ 1025

  const b1BaseX = b1Left + b1Meta.width / 2;
  const b2BaseX = b2Left + b2Meta.width / 2;
  const baseY = bTop + bHeight * 0.985; // ~ 1010

  console.log(`B1 Base: (${b1BaseX}, ${baseY}), B2 Base: (${b2BaseX}, ${baseY})`);

  // --- SVG 1: BACKGROUND & CONTACT SHADOWS ---
  const backgroundSvg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Sunny Overhead Studio Radial Gradient -->
    <radialGradient id="sunnySpotlight" cx="50%" cy="38%" r="68%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="35%" stop-color="#F97316"/>
      <stop offset="65%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </radialGradient>

    <!-- Floor Horizon Radial -->
    <radialGradient id="floorHorizon" cx="50%" cy="100%" r="70%">
      <stop offset="0%" stop-color="#7C2D12" stop-opacity="0.38"/>
      <stop offset="60%" stop-color="#7C2D12" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>

    <!-- Deep Ambient Occlusion Contact Shadow (Tight under bottle) -->
    <radialGradient id="aoShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2D0A03" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#431407" stop-opacity="0.55"/>
      <stop offset="80%" stop-color="#7C2D12" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>

    <!-- Soft Studio Directional Shadow (spread forward) -->
    <radialGradient id="diffuseShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#431407" stop-opacity="0.5"/>
      <stop offset="50%" stop-color="#7C2D12" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>

    <!-- Translucent Ice Bed Base -->
    <linearGradient id="iceBedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.5"/>
      <stop offset="50%" stop-color="#E0F2FE" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#BAE6FD" stop-opacity="0.15"/>
    </linearGradient>
  </defs>

  <!-- 1. SOLID VIBRANT ORANGE STUDIO BACKGROUND -->
  <rect width="${width}" height="${height}" fill="url(#sunnySpotlight)"/>

  <!-- 2. STUDIO FLOOR HORIZON & PERSPECTIVE PLANE -->
  <ellipse cx="800" cy="1180" rx="1000" ry="220" fill="url(#floorHorizon)"/>

  <!-- 3. CONTACT OCCLUSION & DIRECTIONAL SHADOWS (Beneath bottles) -->
  <!-- Left Bottle Shadows -->
  <ellipse cx="${b1BaseX}" cy="${baseY + 12}" rx="230" ry="46" fill="url(#diffuseShadow)"/>
  <ellipse cx="${b1BaseX}" cy="${baseY + 4}" rx="160" ry="24" fill="url(#aoShadow)"/>

  <!-- Right Bottle Shadows -->
  <ellipse cx="${b2BaseX}" cy="${baseY + 12}" rx="230" ry="46" fill="url(#diffuseShadow)"/>
  <ellipse cx="${b2BaseX}" cy="${baseY + 4}" rx="160" ry="24" fill="url(#aoShadow)"/>

  <!-- Bed of frost/ice mist base beneath bottles -->
  <ellipse cx="800" cy="${baseY + 8}" rx="560" ry="38" fill="url(#iceBedGrad)"/>
</svg>
`;

  // --- SVG 2: FOREGROUND PROPS (Crushed Ice Mound, 2 Fresh Lemon Halves, Pink Rock Salt) ---
  const foregroundSvg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Citrus Rind Gradient -->
    <radialGradient id="lemonRindGrad" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="75%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#CA8A04"/>
    </radialGradient>

    <!-- Citrus Pith Gradient -->
    <linearGradient id="pithGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FEF9C3"/>
    </linearGradient>

    <!-- Translucent Juicy Pulp Gradient -->
    <radialGradient id="pulpGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="60%" stop-color="#FACC15"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </radialGradient>

    <!-- Ice Crystal Prism Gradient -->
    <linearGradient id="iceCrystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="45%" stop-color="#F0F9FF" stop-opacity="0.75"/>
      <stop offset="85%" stop-color="#BAE6FD" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#E0F2FE" stop-opacity="0.8"/>
    </linearGradient>

    <!-- Drop Shadow for Props -->
    <radialGradient id="propShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B1104" stop-opacity="0.65"/>
      <stop offset="50%" stop-color="#7C2D12" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- 1. CRUSHED ICE BED CLUSTER (Hugging and overlapping bottle bases) -->
  <g>
    ${generateCrushedIceField(width, baseY - 5)}
  </g>

  <!-- 2. LEFT LEMON HALF (Fresh cross section, resting on ice & orange table) -->
  <g transform="translate(260, ${baseY - 20})">
    <!-- Contact Shadow -->
    <ellipse cx="0" cy="80" rx="90" ry="24" fill="url(#propShadow)"/>
    <!-- Fresh Cut Lemon Half -->
    ${generateLemonHalfSvg(78, 18)}
    <!-- Fresh Mint Leaves resting beside lemon -->
    <path d="M -60 40 Q -95 15 -105 45 Q -95 75 -60 55 Z" fill="#15803D" stroke="#166534" stroke-width="1.5"/>
    <path d="M -60 40 L -105 45" stroke="#86EFAC" stroke-width="1.2" opacity="0.8"/>
    <path d="M -50 50 Q -75 80 -100 70 Q -85 50 -50 50 Z" fill="#16A34A" stroke="#15803D" stroke-width="1.5"/>
  </g>

  <!-- 3. RIGHT LEMON WEDGE & SECOND LEMON HALF -->
  <g transform="translate(1320, ${baseY - 15})">
    <!-- Shadow -->
    <ellipse cx="0" cy="75" rx="95" ry="25" fill="url(#propShadow)"/>
    <!-- Fresh Lemon Half (Slightly tilted angle) -->
    ${generateLemonHalfSvg(72, -28)}
  </g>

  <!-- 4. FRESH LEMON WEDGE IN FOREGROUND RIGHT -->
  <g transform="translate(1210, ${baseY + 15})">
    <ellipse cx="0" cy="55" rx="75" ry="18" fill="url(#propShadow)"/>
    ${generateLemonWedgeSvg(70, -10)}
  </g>

  <!-- 5. HIMALAYAN PINK ROCK SALT PILE (Next to right lemon props) -->
  <g transform="translate(1370, ${baseY + 25})">
    <!-- Rock salt base shadow -->
    <ellipse cx="0" cy="28" rx="65" ry="18" fill="url(#propShadow)"/>
    <!-- Real Pink Salt Crystals -->
    ${generatePinkSaltPile(24)}
  </g>

  <!-- 6. ULTRA-SUBTLE WATER CONDENSATION PUDDLES & DROPLETS ON SURFACE -->
  <ellipse cx="530" cy="${baseY + 45}" rx="140" ry="14" fill="#FFFFFF" fill-opacity="0.12"/>
  <ellipse cx="1070" cy="${baseY + 45}" rx="140" ry="14" fill="#FFFFFF" fill-opacity="0.12"/>
</svg>
`;

  console.log('Rendering SVG backgrounds and foregrounds...');
  const bgBuffer = await sharp(Buffer.from(backgroundSvg)).png().toBuffer();
  const fgBuffer = await sharp(Buffer.from(foregroundSvg)).png().toBuffer();

  console.log('Compositing master duo photo...');
  const finalImage = await sharp(bgBuffer)
    .composite([
      { input: b1Resized, left: b1Left, top: bTop },
      { input: b2Resized, left: b2Left, top: bTop },
      { input: fgBuffer, left: 0, top: 0 }
    ])
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  const outJpgPath = 'brand-kit/creatives/12-both-flavours-duo.jpg';
  const outPngPath = 'brand-kit/creatives/12-both-flavours-duo.png';
  const pubJpgPath = 'public/creatives/12-both-flavours-duo.jpg';
  const pubPngPath = 'public/creatives/12-both-flavours-duo.png';

  fs.writeFileSync(outJpgPath, finalImage);
  fs.writeFileSync(pubJpgPath, finalImage);

  await sharp(finalImage).png({ compressionLevel: 8 }).toFile(outPngPath);
  await sharp(finalImage).png({ compressionLevel: 8 }).toFile(pubPngPath);

  console.log(`Successfully generated:\n- ${outJpgPath}\n- ${outPngPath}\n- ${pubJpgPath}\n- ${pubPngPath}`);
}

buildDuoMasterpiece().catch(console.error);
