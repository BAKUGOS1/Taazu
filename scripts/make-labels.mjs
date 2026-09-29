import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { PDFDocument } from 'pdf-lib';

// ============================================================================
// Taazu Bottle Label Specifications & Dimensions
// 250 ml PET Bottle (Body Diameter: 55 mm)
// ============================================================================

export const LABEL_SPECS = {
  // Bottle Mould Geometry
  bottleVolumeMl: 250,
  bottleDiameterMm: 55,
  circumferenceMm: 172.8,   // Math.PI * 55 = 172.7876 mm
  glueOverlapMm: 8.0,       // overlap strip on right edge (no text)

  // Label Cut & Bleed Dimensions
  trimWidthMm: 181.0,       // 172.8 mm circumference + 8 mm glue overlap rounded to 181 mm
  trimHeightMm: 95.0,       // height of shrink / wrap sleeve
  bleedMm: 3.0,             // 3 mm bleed on all 4 edges
  safeMarginMm: 3.0,        // 3 mm inside trim boundary

  // Total Canvas Dimensions with Bleed
  canvasWidthMm: 187.0,     // 181 + 3 + 3
  canvasHeightMm: 101.0,    // 95 + 3 + 3

  // Export Resolutions
  printDpi: 300,
  targetPngWidthPx: 2205,   // exact target specified in prompt
  targetPngHeightPx: 1193,  // exact target specified in prompt

  // Panel Widths (Trim Coordinates, left-to-right)
  panels: {
    back: 62.0,             // 62 mm BACK panel
    side1: 12.0,            // 12 mm side strip
    front: 70.0,            // 70 mm FRONT panel
    side2: 29.0,            // 29 mm side strip
    overlap: 8.0            // 8 mm glue overlap strip (no text)
  },

  // Flavour Band Dimensions
  bandHeightMm: 20.0,
  bandYMm: 38.0,            // vertical placement matching references 09 and 11
  greenStripHeightMm: 6.0,
  greenStripYMm: 58.0,      // directly under flavour band

  // Brand Palette
  colors: {
    cream: '#FFF8E7',
    orange: '#E0561B',
    classicYellow: '#F2D22E',
    jeeraBrown: '#8A4B1F',
    leafGreen: '#1F7A3A',
    inkDark: '#1C1917',
    inkMuted: '#57534E',
    white: '#FFFFFF',
    borderGray: '#E5E7EB',
    tableBg: '#FBF8F0'
  }
};

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'brand-kit', 'labels');
const ASSETS_DIR = path.join(OUTPUT_DIR, 'assets');
const FONTS_DIR = path.join(ROOT_DIR, 'scratch', 'fonts');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(ASSETS_DIR, { recursive: true });

// ============================================================================
// 1. Process Logo: Soft-edge Unmult (Remove White Background) & Trim Bounding Box
// ============================================================================
async function createTransparentPng(inputPath, outputPath, thresh = 4, ramp = 60) {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const outRgba = Buffer.alloc(w * h * 4);

  for (let i = 0; i < w * h; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const d = 255 - Math.min(r, g, b);

    let a = 0;
    if (d > thresh) {
      a = Math.min(1.0, (d - thresh) / ramp);
    }

    let fgR = r, fgG = g, fgB = b;
    if (a > 0.01 && a < 0.999) {
      fgR = Math.max(0, Math.min(255, Math.round((r - (1 - a) * 255) / a)));
      fgG = Math.max(0, Math.min(255, Math.round((g - (1 - a) * 255) / a)));
      fgB = Math.max(0, Math.min(255, Math.round((b - (1 - a) * 255) / a)));
    }

    outRgba[i * 4] = fgR;
    outRgba[i * 4 + 1] = fgG;
    outRgba[i * 4 + 2] = fgB;
    outRgba[i * 4 + 3] = Math.round(a * 255);
  }

  // Trim empty padding so the logo fills the bounding box crisply
  await sharp(outRgba, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .png()
    .toFile(outputPath);

  return outputPath;
}

function fileToDataUri(filePath) {
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

// ============================================================================
// 2. Realistic Vector Illustration Components (Bright Lemon Slices, Mint, Cumin)
// ============================================================================
function getCuminSeed(x, y, scale = 1.0, rot = 0, tone = 'mid') {
  let bodyFill = '#7A3F18';
  let ridgeStroke = '#B87333';
  let darkStroke = '#4E240B';
  let lightStroke = '#D9985F';

  if (tone === 'dark') {
    bodyFill = '#52280C';
    ridgeStroke = '#8B481C';
    darkStroke = '#321504';
    lightStroke = '#A86230';
  } else if (tone === 'light') {
    bodyFill = '#924E22';
    ridgeStroke = '#DCA068';
    darkStroke = '#622F0E';
    lightStroke = '#F5C698';
  } else if (tone === 'golden') {
    bodyFill = '#A05828';
    ridgeStroke = '#E5AF7A';
    darkStroke = '#6D3410';
    lightStroke = '#FDE2C4';
  }

  return `
  <g transform="translate(${x}, ${y}) rotate(${rot}) scale(${scale})">
    <!-- Seed Drop Shadow -->
    <path d="M 0.2 -2.4 C 0.85 -1.4, 0.85 1.5, 0.2 2.5 C -0.55 1.5, -0.55 -1.4, 0.2 -2.4 Z" fill="#200C02" opacity="0.45" transform="translate(0.18, 0.28)"/>
    <!-- Seed Body -->
    <path d="M 0 -2.6 C 0.78 -1.5, 0.78 1.5, 0 2.6 C -0.78 1.5, -0.78 -1.5, 0 -2.6 Z" fill="${bodyFill}"/>
    <!-- Longitudinal Ridges -->
    <path d="M 0 -2.3 L 0 2.3" stroke="${ridgeStroke}" stroke-width="0.22" stroke-linecap="round"/>
    <path d="M -0.38 -1.8 C -0.52 -0.9, -0.52 0.9, -0.38 1.8" stroke="${darkStroke}" stroke-width="0.16" fill="none"/>
    <path d="M 0.38 -1.8 C 0.52 -0.9, 0.52 0.9, 0.38 1.8" stroke="${lightStroke}" stroke-width="0.16" fill="none"/>
  </g>`;
}

function getCuminSeedPileSvg(cx, cy, scale = 1.0) {
  // Generates a rich, wide mound of roasted cumin seeds under the lemons matching reference 14
  const seeds = [];

  // Deep background shadow bed
  seeds.push(`<ellipse cx="${cx}" cy="${cy + 3.2}" rx="${16.5 * scale}" ry="${3.8 * scale}" fill="#241004" opacity="0.32" filter="url(#soft-blur)"/>`);

  // Layer 1: Back & Flanking wings of the mound (extends to x = +/- 15)
  const layer1 = [
    [-15.0, 3.8, 0.85, -25, 'dark'], [-13.2, 3.2, 0.9, 35, 'dark'], [-11.5, 2.5, 0.95, -45, 'dark'],
    [-9.5, 1.8, 1.0, 15, 'dark'], [-8.0, 1.2, 0.95, -60, 'dark'], [-6.2, 0.8, 0.9, 30, 'dark'],
    [6.2, 0.8, 0.9, -30, 'dark'], [8.0, 1.2, 0.95, 60, 'dark'], [9.8, 1.9, 1.0, -20, 'dark'],
    [11.8, 2.6, 0.95, 45, 'dark'], [13.5, 3.3, 0.9, -35, 'dark'], [15.2, 4.0, 0.85, 25, 'dark'],
    [-4.5, 0.5, 0.85, -15, 'dark'], [-2.0, 0.3, 0.9, 20, 'dark'], [0.5, 0.2, 0.9, -10, 'dark'],
    [3.0, 0.4, 0.85, 40, 'dark']
  ];

  // Layer 2: Mid-mound density (tight cluster forming the pile body)
  const layer2 = [
    [-14.0, 4.4, 0.9, 55, 'mid'], [-12.2, 4.0, 1.0, -15, 'mid'], [-10.2, 3.5, 1.05, 40, 'mid'],
    [-8.5, 3.0, 1.1, -30, 'mid'], [-6.5, 2.8, 1.15, 65, 'mid'], [-4.5, 2.7, 1.1, -10, 'mid'],
    [-2.5, 2.8, 1.15, 30, 'mid'], [-0.5, 2.9, 1.2, -45, 'mid'], [1.8, 2.8, 1.15, 15, 'mid'],
    [3.8, 2.7, 1.1, -35, 'mid'], [5.8, 2.9, 1.15, 50, 'mid'], [7.8, 3.2, 1.1, -20, 'mid'],
    [9.8, 3.6, 1.05, 35, 'mid'], [11.8, 4.1, 1.0, -50, 'mid'], [13.8, 4.6, 0.9, 20, 'mid'],
    [-7.5, 4.2, 1.0, -65, 'mid'], [-5.0, 4.1, 1.05, 25, 'mid'], [-2.0, 4.3, 1.1, -15, 'mid'],
    [1.0, 4.3, 1.1, 35, 'mid'], [4.0, 4.2, 1.05, -40, 'mid'], [6.8, 4.3, 1.0, 60, 'mid']
  ];

  // Layer 3: Foreground face & bottom edge (overlapping, crisp roasted cumin seeds)
  const layer3 = [
    [-15.5, 5.0, 0.8, -10, 'light'], [-13.5, 5.2, 0.9, 40, 'light'], [-11.5, 5.3, 0.95, -25, 'golden'],
    [-9.5, 5.4, 1.05, 15, 'light'], [-7.5, 5.5, 1.1, -45, 'golden'], [-5.5, 5.6, 1.15, 30, 'light'],
    [-3.5, 5.8, 1.2, -15, 'golden'], [-1.2, 5.9, 1.2, 20, 'light'], [1.2, 5.9, 1.2, -30, 'golden'],
    [3.5, 5.8, 1.15, 45, 'light'], [5.5, 5.6, 1.1, -10, 'golden'], [7.5, 5.5, 1.05, 55, 'light'],
    [9.5, 5.4, 1.0, -35, 'golden'], [11.5, 5.2, 0.95, 20, 'light'], [13.5, 5.0, 0.9, -60, 'golden'],
    [15.0, 4.8, 0.8, 35, 'light'],
    [-8.0, 6.6, 0.9, 80, 'light'], [-4.0, 6.8, 0.95, -20, 'golden'],
    [0.0, 6.9, 1.0, 10, 'light'], [4.5, 6.7, 0.95, -50, 'golden'], [8.2, 6.5, 0.9, 40, 'light']
  ];

  for (const s of [...layer1, ...layer2, ...layer3]) {
    seeds.push(getCuminSeed(cx + s[0] * scale, cy + s[1] * scale, s[2] * scale, s[3], s[4]));
  }

  return `<g id="cumin-seed-pile">${seeds.join('\n')}</g>`;
}

function getBrightLemonSliceSvg(x, y, scale = 1.0, rotation = 0) {
  return `
  <g transform="translate(${x}, ${y}) rotate(${rotation}) scale(${scale})">
    <!-- Soft Contact Shadow -->
    <ellipse cx="0" cy="7.8" rx="8.5" ry="2.2" fill="#2E1C0A" opacity="0.16" filter="url(#soft-blur)"/>

    <!-- Outer Citrus Rind (Bright Sunny Lemon Yellow) -->
    <circle cx="0" cy="0" r="7.5" fill="#FDD835" stroke="#FBC02D" stroke-width="0.3"/>
    <circle cx="0" cy="0" r="7.3" fill="none" stroke="#FFEE58" stroke-width="0.2"/>
    <!-- Crisp White Inner Pith -->
    <circle cx="0" cy="0" r="6.8" fill="#FFFFFF"/>
    <!-- Radiant Translucent Pulp Base -->
    <circle cx="0" cy="0" r="6.2" fill="#FFF59D"/>

    <!-- 8 Juicy Triangular Segments -->
    <g fill="#FDD835" stroke="#FFFFFF" stroke-width="0.38">
      <path d="M 0 0 L 0 -5.8 A 5.8 5.8 0 0 1 4.1 -4.1 Z"/>
      <path d="M 0 0 L 4.1 -4.1 A 5.8 5.8 0 0 1 5.8 0 Z"/>
      <path d="M 0 0 L 5.8 0 A 5.8 5.8 0 0 1 4.1 4.1 Z"/>
      <path d="M 0 0 L 4.1 4.1 A 5.8 5.8 0 0 1 0 5.8 Z"/>
      <path d="M 0 0 L 0 5.8 A 5.8 5.8 0 0 1 -4.1 4.1 Z"/>
      <path d="M 0 0 L -4.1 4.1 A 5.8 5.8 0 0 1 -5.8 0 Z"/>
      <path d="M 0 0 L -5.8 0 A 5.8 5.8 0 0 1 -4.1 -4.1 Z"/>
      <path d="M 0 0 L -4.1 -4.1 A 5.8 5.8 0 0 1 0 -5.8 Z"/>
    </g>

    <!-- Inner segment highlights -->
    <g fill="#FFEE58" opacity="0.85">
      <circle cx="2.2" cy="-3.6" r="1.1"/>
      <circle cx="3.6" cy="-2.2" r="1.1"/>
      <circle cx="3.6" cy="2.2" r="1.1"/>
      <circle cx="2.2" cy="3.6" r="1.1"/>
      <circle cx="-2.2" cy="3.6" r="1.1"/>
      <circle cx="-3.6" cy="2.2" r="1.1"/>
      <circle cx="-3.6" cy="-2.2" r="1.1"/>
      <circle cx="-2.2" cy="-3.6" r="1.1"/>
    </g>

    <!-- Center White Star / Core -->
    <circle cx="0" cy="0" r="1.15" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="0.6" fill="#FFF9C4"/>

    <!-- Specular Juicy Droplet Glints -->
    <circle cx="1.8" cy="-2.5" r="0.5" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="-2.2" cy="1.6" r="0.45" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="2.6" cy="1.8" r="0.5" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="-1.5" cy="-2.8" r="0.45" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="0" cy="-3.8" r="0.4" fill="#FFFFFF" opacity="0.85"/>
    <circle cx="3.8" cy="0" r="0.4" fill="#FFFFFF" opacity="0.85"/>
  </g>`;
}

function getBrightLemonWedgeSvg(x, y, scale = 1.0, rotation = 0) {
  return `
  <g transform="translate(${x}, ${y}) rotate(${rotation}) scale(${scale})">
    <!-- Contact Shadow -->
    <ellipse cx="0" cy="5.2" rx="6.5" ry="1.8" fill="#2E1C0A" opacity="0.16" filter="url(#soft-blur)"/>

    <!-- Outer Bright Yellow Rind -->
    <path d="M -6.5 3 C -6.5 -3.5, 6.5 -3.5, 6.5 3 C 5.5 5.5, -5.5 5.5, -6.5 3 Z" fill="#FDD835" stroke="#FBC02D" stroke-width="0.3"/>
    <!-- Crisp White Pith Arc -->
    <path d="M -5.8 2.6 C -5.8 -2.8, 5.8 -2.8, 5.8 2.6 C 4.8 4.8, -4.8 4.8, -5.8 2.6 Z" fill="#FFFFFF"/>
    <!-- Radiant Sunny Pulp Core -->
    <path d="M -5.2 2.3 C -5.2 -2.2, 5.2 -2.2, 5.2 2.3 C 4.2 4.2, -4.2 4.2, -5.2 2.3 Z" fill="#FDD835"/>
    <path d="M -4.5 1.8 C -4.5 -1.6, 4.5 -1.6, 4.5 1.8 C 3.6 3.4, -3.6 3.4, -4.5 1.8 Z" fill="#FFEE58" opacity="0.85"/>

    <!-- Radial Dividing Membranes -->
    <g stroke="#FFFFFF" stroke-width="0.38" fill="none" stroke-linecap="round">
      <path d="M 0 2.3 L 0 -2.0"/>
      <path d="M 0 2.3 L -2.4 -1.4"/>
      <path d="M 0 2.3 L 2.4 -1.4"/>
      <path d="M 0 2.3 L -4.2 0.2"/>
      <path d="M 0 2.3 L 4.2 0.2"/>
    </g>

    <!-- Glistening Juicy Highlights -->
    <circle cx="-1.5" cy="-0.5" r="0.45" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="1.6" cy="0.6" r="0.5" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="0" cy="1.0" r="0.4" fill="#FFFFFF" opacity="0.85"/>
    <circle cx="-3.2" cy="0.8" r="0.35" fill="#FFFFFF" opacity="0.85"/>
  </g>`;
}

function getMintSprigSvg(x, y, scale = 1.0, rotation = 0) {
  return `
  <g transform="translate(${x}, ${y}) rotate(${rotation}) scale(${scale})">
    <!-- Main Upright Leaf -->
    <g transform="translate(0, 0) rotate(-10)">
      <path d="M 0 0 C -2.2 -3, -3.8 -7, 0 -11 C 3.8 -7, 2.2 -3, 0 0 Z" fill="#1B5E20"/>
      <path d="M 0 0 C -1.4 -2.6, -2.4 -6, 0 -10 C 2.4 -6, 1.4 -2.6, 0 0 Z" fill="#2E7D32" opacity="0.9"/>
      <path d="M 0 0 L 0 -9.5" stroke="#A5D6A7" stroke-width="0.25" stroke-linecap="round"/>
      <path d="M 0 -2.5 L -1.5 -4.2 M 0 -2.5 L 1.5 -4.2 M 0 -5 L -1.8 -6.8 M 0 -5 L 1.8 -6.8 M 0 -7.5 L -1.2 -8.8 M 0 -7.5 L 1.2 -8.8" stroke="#A5D6A7" stroke-width="0.2"/>
    </g>
    <!-- Second Leaf -->
    <g transform="translate(3.2, 0.5) rotate(35) scale(0.8)">
      <path d="M 0 0 C -2.0 -2.8, -3.2 -6, 0 -9 C 3.2 -6, 2.0 -2.8, 0 0 Z" fill="#1B5E20"/>
      <path d="M 0 0 C -1.2 -2.4, -2.0 -5, 0 -8.2 C 2.0 -5, 1.2 -2.4, 0 0 Z" fill="#2E7D32"/>
      <path d="M 0 0 L 0 -7.5" stroke="#81C784" stroke-width="0.22" stroke-linecap="round"/>
    </g>
  </g>`;
}

function getCenterLemonDuoSvg(x, y, scale = 1.0, isJeera = false) {
  return `
  <g transform="translate(${x}, ${y}) scale(${scale})">
    ${isJeera ? `
    <!-- Jeera Roasted Cumin Seed Mound Under Lemons (Matching Reference 14) -->
    ${getCuminSeedPileSvg(0, 1.2, 0.95)}
    ` : `
    <!-- Classic Soft Ground Shadow -->
    <ellipse cx="0" cy="6.2" rx="11.5" ry="1.8" fill="#2E1C0A" opacity="0.16" filter="url(#soft-blur)"/>
    `}

    <!-- Fresh Mint Leaves tucked behind -->
    ${getMintSprigSvg(-0.5, -0.5, 0.65, 5)}

    <!-- Left Lemon Round (Juicy Cross Section, Bright Lemon Yellow) -->
    ${getBrightLemonSliceSvg(-5.2, 1.2, 1.05, -14)}

    <!-- Right Lemon Wedge tilted slightly (Bright Lemon Yellow) -->
    ${getBrightLemonWedgeSvg(5.2, 2.0, 1.0, 22)}
  </g>`;
}

function getCuminSeedSvg(x, y, scale = 1.0, rotation = 0) {
  return getCuminSeed(x, y, scale, rotation, 'mid');
}

function getBandCuminSeedsSvg(centerX, centerY) {
  return `
  <!-- Left Side Seeds on Brown Band -->
  <g opacity="0.75">
    ${getCuminSeed(centerX - 24, centerY - 3, 1.15, -35, 'golden')}
    ${getCuminSeed(centerX - 27.5, centerY + 2.5, 0.95, 25, 'light')}
    ${getCuminSeed(centerX - 22, centerY + 4.5, 0.85, -60, 'mid')}
  </g>
  <!-- Right Side Seeds on Brown Band -->
  <g opacity="0.75">
    ${getCuminSeed(centerX + 24, centerY - 3, 1.15, 35, 'golden')}
    ${getCuminSeed(centerX + 27.5, centerY + 2.5, 0.95, -25, 'light')}
    ${getCuminSeed(centerX + 22, centerY + 4.5, 0.85, 60, 'mid')}
  </g>`;
}

// Official European & International Standard Estimated Sign (U+212E / e-mark, EU Directive 2009/34/EC)
function getEstimatedSignSvg(x, y, height = 2.1, fill = '#57534E', strokeW = 36) {
  const scale = height / 900;
  return `<path transform="translate(${x}, ${y}) scale(${scale}) translate(-40, -40)" d="m540 40a500 450 0 0 0 -500 450 500 450 0 0 0 500 450 500 450 0 0 0 395 -174h-75a423 423 0 0 1 -320 147 423 423 0 0 1 -291 -116 85 85 0 0 1 -26 -61v-220a13 13 0 0 1 13 -13h804v-13a500 450 0 0 0 -500 -450zm0 27a423 423 0 0 1 291 116 85 85 0 0 1 26 61v221a13 13 0 0 1 -13 13h-608a13 13 0 0 1 -13 -13v-221a85 85 0 0 1 26 -61 423 423 0 0 1 291 -116z" fill="${fill}" stroke="${strokeW > 0 ? fill : 'none'}" stroke-width="${strokeW}"/>`;
}

// ============================================================================
// 3. SVG Builder Function (Real Editable Text + Semantic Layers)
// ============================================================================
export function generateLabelSvg(flavor = 'classic', options = {}) {
  const isClassic = flavor === 'classic';
  const c = LABEL_SPECS.colors;

  const bandColor = isClassic ? c.classicYellow : c.jeeraBrown;
  const bandTextColor = isClassic ? c.white : c.cream;
  const bandLine1 = isClassic ? 'CLASSIC' : 'JEERA';
  const bandLine2 = isClassic ? 'NIMBU NAMAK' : 'MASALA';
  const greenText = isClassic ? 'LEMON-SALT ELECTROLYTE DRINK' : 'SPICED CUMIN ELECTROLYTE DRINK';
  const productName = isClassic ? 'Taazu Classic Nimbu Namak' : 'Taazu Jeera Masala';

  const logoFrontDataUri = options.logoFrontUri || '';
  const logoIconDataUri = options.logoIconUri || '';

  const canvasW = LABEL_SPECS.canvasWidthMm;   // 187 mm
  const canvasH = LABEL_SPECS.canvasHeightMm;  // 101 mm
  const bleed = LABEL_SPECS.bleedMm;           // 3 mm

  // Horizontal Coordinates
  const frontCenterX = bleed + LABEL_SPECS.panels.back + LABEL_SPECS.panels.side1 + (LABEL_SPECS.panels.front / 2); // 112 mm
  const backPanelX = bleed + 3.0; // 6 mm (3mm bleed + 3mm safe)
  const backPanelW = LABEL_SPECS.panels.back - 6.0; // 56 mm safe width
  const backCenterX = backPanelX + (backPanelW / 2); // 34 mm

  // Vertical Coordinates
  const bandY = LABEL_SPECS.bandYMm;             // 38 mm
  const bandH = LABEL_SPECS.bandHeightMm;        // 20 mm
  const greenY = LABEL_SPECS.greenStripYMm;      // 58 mm
  const greenH = LABEL_SPECS.greenStripHeightMm; // 6 mm

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${canvasW}mm" height="${canvasH}mm" viewBox="0 0 ${canvasW} ${canvasH}">
  <defs>
    <!-- Google Fonts -->
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap');

      .font-display-bold {
        font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
        font-weight: 800;
        text-transform: uppercase;
      }
      .font-display-semibold {
        font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
        font-weight: 700;
        text-transform: uppercase;
      }
      .font-body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    </style>

    <!-- Filters -->
    <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.4"/>
    </filter>

    <filter id="classic-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0.35" stdDeviation="0.25" flood-color="#A88100" flood-opacity="0.55"/>
    </filter>

    <filter id="jeera-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0.35" stdDeviation="0.25" flood-color="#4A240A" flood-opacity="0.6"/>
    </filter>

    <pattern id="overlap-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="4" stroke="#D1D5DB" stroke-width="0.75" />
    </pattern>
  </defs>

  <!-- ===================================================================== -->
  <!-- LAYER 1: BASE CANVAS BACKGROUND (187 x 101 mm with Bleed)             -->
  <!-- ===================================================================== -->
  <g id="layer-background">
    <rect width="${canvasW}" height="${canvasH}" fill="${c.cream}" />
  </g>

  <!-- ===================================================================== -->
  <!-- LAYER 2: FLAVOUR BAND & GREEN STRIP (Runs across Front Panel)          -->
  <!-- ===================================================================== -->
  <g id="layer-flavour-band">
    <rect x="${bleed + LABEL_SPECS.panels.back + LABEL_SPECS.panels.side1}" y="${bandY}" width="${canvasW - (bleed + LABEL_SPECS.panels.back + LABEL_SPECS.panels.side1)}" height="${bandH}" fill="${bandColor}" />
    ${!isClassic ? getBandCuminSeedsSvg(frontCenterX, bandY + 10) : ''}
  </g>

  <g id="layer-green-strip">
    <rect x="${bleed + LABEL_SPECS.panels.back + LABEL_SPECS.panels.side1}" y="${greenY}" width="${canvasW - (bleed + LABEL_SPECS.panels.back + LABEL_SPECS.panels.side1)}" height="${greenH}" fill="${c.leafGreen}" />
  </g>

  <!-- ===================================================================== -->
  <!-- LAYER 3: FRONT PANEL (70 mm wide, Centered at x = ${frontCenterX} mm)           -->
  <!-- ===================================================================== -->
  <g id="layer-front-panel">
    <!-- 1. FRONT LOGO (Drop icon above orange TAAZU wordmark with TM) ~34 mm wide -->
    <g id="front-logo">
      ${logoFrontDataUri ? `
      <!-- High-res Transparent Trimmed Master Logo -->
      <image href="${logoFrontDataUri}" x="${frontCenterX - 17.0}" y="4.5" width="34.0" height="32.5" preserveAspectRatio="xMidYMid meet" />
      ` : `
      <text class="font-display-bold" x="${frontCenterX}" y="32" font-size="12" fill="${c.orange}" text-anchor="middle" letter-spacing="1">TAAZU<tspan font-size="5" dy="-5">TM</tspan></text>
      `}
    </g>

    <!-- 2. FLAVOUR BAND TEXT (Centered in front panel) -->
    <g id="front-band-text" filter="${isClassic ? 'url(#classic-shadow)' : 'url(#jeera-shadow)'}">
      <text class="font-display-bold" x="${frontCenterX}" y="${bandY + 8.2}" font-size="8.4" fill="${bandTextColor}" text-anchor="middle" letter-spacing="0.8">${bandLine1}</text>
      <text class="font-display-bold" x="${frontCenterX}" y="${bandY + 16.6}" font-size="7.6" fill="${bandTextColor}" text-anchor="middle" letter-spacing="0.9">${bandLine2}</text>
    </g>

    <!-- 3. GREEN STRIP TEXT -->
    <g id="front-green-text">
      <text class="font-display-semibold" x="${frontCenterX}" y="${greenY + 4.2}" font-size="2.65" fill="${c.white}" text-anchor="middle" letter-spacing="0.65">${greenText}</text>
    </g>

    <!-- 4. CENTER ILLUSTRATION & SCATTERED FLAVOUR ELEMENTS -->
    <g id="front-illustrations">
      <!-- Main Center Duo: Two lemon slices + mint leaf, seated comfortably below green strip -->
      ${getCenterLemonDuoSvg(frontCenterX, 74.0, 0.95, !isClassic)}

      ${isClassic ? `
      <!-- Classic Flanking Elements (Scattered lemon slices & mint leaves near edges matching Ref 13) -->
      ${getBrightLemonWedgeSvg(frontCenterX - 38, 88, 0.75, -20)}
      ${getMintSprigSvg(frontCenterX - 42, 92, 0.7, -40)}
      ${getMintSprigSvg(frontCenterX - 38, 70, 0.7, -45)}
      ${getBrightLemonWedgeSvg(frontCenterX + 52, 22, 0.75, -25)}
      ${getMintSprigSvg(frontCenterX + 56, 18, 0.7, 35)}
      ${getBrightLemonWedgeSvg(frontCenterX + 54, 70, 0.75, 25)}
      ${getMintSprigSvg(frontCenterX + 58, 76, 0.7, 45)}
      ${getBrightLemonWedgeSvg(frontCenterX + 52, 88, 0.75, 18)}
      ${getMintSprigSvg(frontCenterX + 58, 92, 0.7, 135)}
      ` : `
      <!-- Jeera Flanking Elements (Scattered cumin seeds & lemon slices near edges matching Ref 14) -->
      ${getCuminSeedSvg(frontCenterX - 18, 68, 0.85, -30)}
      ${getCuminSeedSvg(frontCenterX - 13, 71, 0.75, 20)}
      ${getCuminSeedSvg(frontCenterX - 22, 74, 0.85, 45)}
      ${getCuminSeedSvg(frontCenterX + 16, 68, 0.85, 40)}
      ${getCuminSeedSvg(frontCenterX + 20, 71, 0.75, -20)}
      ${getCuminSeedSvg(frontCenterX - 36, 76, 0.95, 55)}
      ${getCuminSeedSvg(frontCenterX - 38, 84, 0.85, -45)}
      ${getCuminSeedSvg(frontCenterX - 35, 92, 0.85, 30)}
      ${getBrightLemonWedgeSvg(frontCenterX + 52, 16, 0.8, -25)}
      ${getCuminSeedSvg(frontCenterX + 46, 24, 0.85, 35)}
      ${getBrightLemonWedgeSvg(frontCenterX + 54, 28, 0.85, 30)}
      ${getCuminSeedSvg(frontCenterX + 48, 36, 0.9, -45)}
      ${getCuminSeedSvg(frontCenterX + 56, 39, 0.8, 15)}
      ${getBrightLemonWedgeSvg(frontCenterX + 53, 83, 0.85, 18)}
      ${getCuminSeedSvg(frontCenterX + 55, 91, 0.85, -35)}
      `}
    </g>

    <!-- 5. TAGLINE IN ORANGE -->
    <g id="front-tagline">
      <text class="font-display-bold" x="${frontCenterX}" y="86.2" font-size="3.2" fill="${c.orange}" text-anchor="middle" letter-spacing="0.75">REHYDRATE | REFRESH | RECOVER</text>
    </g>

    <!-- 6. STILL | 250 ml WITH VECTOR ℮ MARK -->
    <g id="front-spec">
      <text class="font-display-semibold" x="${frontCenterX - 1.685}" y="91.5" font-size="2.7" fill="${c.inkMuted}" text-anchor="middle" letter-spacing="0.5">STILL | 250 ml</text>
      ${getEstimatedSignSvg(frontCenterX + 9.35, 89.4, 2.1, c.inkMuted, 36)}
    </g>
  </g>

  <!-- ===================================================================== -->
  <!-- LAYER 4: BACK PANEL (62 mm wide, Centered at x = ${backCenterX} mm)            -->
  <!-- Regulatory & FSSAI Mandatory Statutory Information Card               -->
  <!-- ===================================================================== -->
  <g id="layer-back-panel">
    <!-- Plain Cream Canvas (No white card container) -->

    <!-- Ingredients empty placeholder box -->
    <g id="back-ingredients" transform="translate(${backPanelX + 2.5}, 7.0)">
      <rect x="0" y="0" width="${backPanelW - 5.0}" height="14.0" fill="${c.white}" stroke="${c.borderGray}" stroke-width="0.3" rx="0.6"/>
      <text class="font-body" font-size="1.55" fill="${c.inkDark}" font-weight="700" x="2.5" y="4.5">Ingredients:</text>
    </g>

    <!-- Nutrition Information Table (Empty cells without numbers/text) -->
    <g id="back-nutrition-table" transform="translate(${backPanelX + 2.5}, 24.0)">
      <!-- Table Outline -->
      <rect x="0" y="0" width="${backPanelW - 5.0}" height="22.6" fill="${c.white}" stroke="${c.borderGray}" stroke-width="0.3" rx="0.6"/>
      <!-- Header Row -->
      <rect x="0" y="0" width="${backPanelW - 5.0}" height="3.8" fill="#F4EBD4" stroke="${c.borderGray}" stroke-width="0.3" rx="0.6"/>
      <text class="font-body" font-size="1.55" font-weight="700" fill="${c.inkDark}" x="2.0" y="2.6">NUTRITION INFORMATION</text>
      <text class="font-body" font-size="1.4" font-weight="600" fill="${c.inkDark}" x="33" y="2.6" text-anchor="middle">Per 100ml</text>
      <text class="font-body" font-size="1.4" font-weight="600" fill="${c.inkDark}" x="44.5" y="2.6" text-anchor="middle">Per 250ml</text>

      <!-- Table Dividing Lines -->
      <line x1="0" y1="6.15" x2="${backPanelW - 5.0}" y2="6.15" stroke="${c.borderGray}" stroke-width="0.18"/>
      <line x1="0" y1="8.50" x2="${backPanelW - 5.0}" y2="8.50" stroke="${c.borderGray}" stroke-width="0.18"/>
      <line x1="0" y1="10.85" x2="${backPanelW - 5.0}" y2="10.85" stroke="${c.borderGray}" stroke-width="0.18"/>
      <line x1="0" y1="13.20" x2="${backPanelW - 5.0}" y2="13.20" stroke="${c.borderGray}" stroke-width="0.18"/>
      <line x1="0" y1="15.55" x2="${backPanelW - 5.0}" y2="15.55" stroke="${c.borderGray}" stroke-width="0.18"/>
      <line x1="0" y1="17.90" x2="${backPanelW - 5.0}" y2="17.90" stroke="${c.borderGray}" stroke-width="0.18"/>
      <line x1="0" y1="20.25" x2="${backPanelW - 5.0}" y2="20.25" stroke="${c.borderGray}" stroke-width="0.18"/>

      <!-- Vertical Dividers -->
      <line x1="27.5" y1="3.8" x2="27.5" y2="22.6" stroke="${c.borderGray}" stroke-width="0.18"/>
      <line x1="39.0" y1="3.8" x2="39.0" y2="22.6" stroke="${c.borderGray}" stroke-width="0.18"/>

      <!-- Rows (Empty Values) -->
      <g class="font-body" font-size="1.4" fill="${c.inkDark}">
        <text x="2.0" y="5.6" font-weight="600">Energy (kcal)</text>
        <text x="2.0" y="7.9">Protein (g)</text>
        <text x="2.0" y="10.2">Carbohydrate (g)</text>
        <text x="3.2" y="12.5" fill="${c.inkMuted}">Total sugars (g)</text>
        <text x="3.2" y="14.8" fill="${c.inkMuted}">Added sugars (g)</text>
        <text x="2.0" y="17.1">Total fat (g)</text>
        <text x="2.0" y="19.4" font-weight="600">Sodium (mg)</text>
        <text x="2.0" y="21.7" font-weight="600">Potassium (mg)</text>
      </g>
    </g>

    <!-- Regulatory Compliance Row (Veg Symbol + FSSAI Box) -->
    <g id="back-regulatory" transform="translate(${backPanelX + 2.5}, 50.5)">
      <!-- Green Veg Symbol -->
      <g id="veg-symbol">
        <rect x="0" y="0" width="4.8" height="4.8" fill="none" stroke="#1F7A3A" stroke-width="0.38" rx="0.5"/>
        <circle cx="2.4" cy="2.4" r="1.4" fill="#1F7A3A"/>
      </g>

      <!-- FSSAI Logo & Licence Box -->
      <g id="fssai-box" transform="translate(7.5, 0)">
        <rect x="0" y="0" width="${backPanelW - 12.5}" height="4.8" fill="#F8FAFC" stroke="${c.borderGray}" stroke-width="0.28" rx="0.5"/>
        <text class="font-display-bold" x="2.0" y="3.5" font-size="3.0" fill="#1E3A8A" letter-spacing="0.2">fssai</text>
        <text class="font-body" x="13.5" y="3.2" font-size="1.45" font-weight="600" fill="${c.inkDark}">Lic. No. <tspan font-weight="400" fill="${c.inkMuted}">[14-digit licence]</tspan></text>
      </g>
    </g>

    <!-- Manufacturing, Marketing & Pricing Details -->
    <g id="back-mfg-mkt" transform="translate(${backPanelX + 2.5}, 57.2)">
      <text class="font-body" font-size="1.45" font-weight="600" fill="${c.inkDark}" x="0" y="0">Manufactured by: <tspan font-weight="400" fill="${c.inkMuted}">[co-packer name, address, FSSAI lic.]</tspan></text>
      <text class="font-body" font-size="1.45" font-weight="600" fill="${c.inkDark}" x="0" y="2.3">Marketed by: <tspan font-weight="400" fill="${c.inkMuted}">[brand owner name, address]</tspan></text>
      <text class="font-body" font-size="1.5" font-weight="700" fill="${c.inkDark}" x="0" y="4.8">Net Qty: 250 ml <tspan font-weight="400">·</tspan> MRP &#x20B9;[xx] <tspan font-size="1.2" font-weight="400" fill="${c.inkMuted}">(incl. of all taxes)</tspan></text>
    </g>

    <!-- Inkjet Printing Blank Box -->
    <g id="back-inkjet-box" transform="translate(${backPanelX + 2.5}, 63.8)">
      <rect x="0" y="0" width="${backPanelW - 5.0}" height="7.0" fill="#F9FAFB" stroke="${c.borderGray}" stroke-width="0.28" rx="0.5"/>
      <text class="font-body" font-size="1.35" font-weight="600" fill="${c.inkMuted}" x="2.0" y="2.4">Batch No. / Mfg. Date / Best Before:</text>
      <text class="font-body" font-size="1.3" font-weight="400" fill="#9CA3AF" x="2.0" y="5.0">[SPACE RESERVED FOR INKJET PRINTING]</text>
    </g>

    <!-- Storage Instructions & Customer Care -->
    <g id="back-instructions" transform="translate(${backPanelX + 2.5}, 72.5)">
      <text class="font-body" font-size="1.35" fill="${c.inkDark}" font-weight="500" x="0" y="0">Store in a cool, dry place. Shake well. Refrigerate after opening and consume within 24h.</text>
      <text class="font-body" font-size="1.4" font-weight="600" fill="${c.inkDark}" x="0" y="2.6">Customer care: <tspan font-weight="400" fill="${c.inkMuted}">[phone] · [email]</tspan></text>
    </g>

    <!-- Barcode EAN-13 Box (Empty Placeholder Box) & Origin -->
    <g id="back-barcode-origin" transform="translate(${backPanelX + 2.5}, 77.2)">
      <rect x="0" y="0" width="24.0" height="15.0" fill="${c.white}" stroke="${c.borderGray}" stroke-width="0.28" rx="0.5"/>

      <!-- Origin badge -->
      <g transform="translate(26.0, 2.5)">
        <text class="font-display-semibold" font-size="2.25" fill="${c.orange}" x="0" y="0">MADE IN AHMEDABAD, INDIA</text>
        <text class="font-body" font-size="1.4" font-weight="500" fill="${c.inkMuted}" x="0" y="2.6">100% Recyclable PET Bottle (1)</text>
        <text class="font-body" font-size="1.4" font-weight="500" fill="${c.inkMuted}" x="0" y="4.8">Dispose Responsibly · Keep City Clean</text>
      </g>
    </g>
  </g>

  <!-- ===================================================================== -->
  <!-- LAYER 5: SIDE STRIPS & GLUE OVERLAP (8 mm on Right Edge, No Text)    -->
  <!-- ===================================================================== -->
  ${options.showGlueOverlap ? `
  <g id="layer-glue-overlap">
    <rect x="${canvasW - bleed - LABEL_SPECS.panels.overlap}" y="${bleed}"
          width="${LABEL_SPECS.panels.overlap}" height="${LABEL_SPECS.trimHeightMm}"
          fill="url(#overlap-hatch)" opacity="0.3" />
    <line x1="${canvasW - bleed - LABEL_SPECS.panels.overlap}" y1="${bleed}"
          x2="${canvasW - bleed - LABEL_SPECS.panels.overlap}" y2="${canvasH - bleed}"
          stroke="#9CA3AF" stroke-width="0.4" stroke-dasharray="1 1" />
    <text class="font-body" font-size="1.6" font-weight="600" fill="#9CA3AF"
          transform="translate(${canvasW - bleed - 3.5}, ${canvasH / 2}) rotate(-90)"
          text-anchor="middle" letter-spacing="0.4">GLUE OVERLAP AREA (NO TEXT)</text>
  </g>
  ` : ''}

  ${options.showGuides ? `
  <!-- LAYER 6: PRINT PREPRESS GUIDES (Bleed, Trim, Safe Margins) -->
  <g id="layer-print-guides" opacity="0.85">
    <rect x="${bleed}" y="${bleed}" width="${LABEL_SPECS.trimWidthMm}" height="${LABEL_SPECS.trimHeightMm}"
          fill="none" stroke="#EF4444" stroke-width="0.35" stroke-dasharray="2 1" />
    <rect x="${bleed + LABEL_SPECS.safeMarginMm}" y="${bleed + LABEL_SPECS.safeMarginMm}"
          width="${LABEL_SPECS.trimWidthMm - (LABEL_SPECS.safeMarginMm * 2)}"
          height="${LABEL_SPECS.trimHeightMm - (LABEL_SPECS.safeMarginMm * 2)}"
          fill="none" stroke="#10B981" stroke-width="0.25" stroke-dasharray="1 1" />
  </g>
  ` : ''}
</svg>`;
}

// ============================================================================
// 4. Outlined Vector SVG Generator (opentype.js Glyph Outline Path Tracing)
// ============================================================================
function loadFontSync(filePath) {
  const buf = fs.readFileSync(filePath);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

function textToVectorPath(font, text, x, y, fontSize, fill, textAnchor = 'start', letterSpacing = 0) {
  const scale = fontSize / font.unitsPerEm;
  let totalAdvance = 0;
  const chars = Array.from(text);
  const glyphs = chars.map(c => font.charToGlyph(c));

  for (let i = 0; i < glyphs.length; i++) {
    totalAdvance += (glyphs[i].advanceWidth || 0) * scale;
    if (i < glyphs.length - 1) totalAdvance += letterSpacing;
  }

  let startX = x;
  if (textAnchor === 'middle') startX = x - totalAdvance / 2;
  else if (textAnchor === 'end') startX = x - totalAdvance;

  let curX = startX;
  const paths = [];

  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const p = g.getPath(curX, y, fontSize);
    paths.push(p.toPathData(2));
    curX += (g.advanceWidth || 0) * scale + letterSpacing;
  }

  return `<path d="${paths.join(' ')}" fill="${fill}" />`;
}

export function generateOutlinedLabelSvg(flavor = 'classic', options = {}) {
  const baseSvg = generateLabelSvg(flavor, options);

  const fontBarlowBold = loadFontSync(path.join(FONTS_DIR, 'BarlowCondensed-Bold.ttf'));
  const fontBarlowSemi = loadFontSync(path.join(FONTS_DIR, 'BarlowCondensed-SemiBold.ttf'));

  const isClassic = flavor === 'classic';
  const c = LABEL_SPECS.colors;
  const bandTextColor = isClassic ? c.white : c.cream;
  const bandLine1 = isClassic ? 'CLASSIC' : 'JEERA';
  const bandLine2 = isClassic ? 'NIMBU NAMAK' : 'MASALA';
  const greenText = isClassic ? 'LEMON-SALT ELECTROLYTE DRINK' : 'SPICED CUMIN ELECTROLYTE DRINK';

  const bleed = LABEL_SPECS.bleedMm;
  const frontCenterX = bleed + LABEL_SPECS.panels.back + LABEL_SPECS.panels.side1 + (LABEL_SPECS.panels.front / 2); // 112 mm
  const bandY = LABEL_SPECS.bandYMm;
  const greenY = LABEL_SPECS.greenStripYMm;

  // Build outlined front panel text
  const pBand1 = textToVectorPath(fontBarlowBold, bandLine1, frontCenterX, bandY + 8.2, 8.4, bandTextColor, 'middle', 0.8);
  const pBand2 = textToVectorPath(fontBarlowBold, bandLine2, frontCenterX, bandY + 16.6, 7.6, bandTextColor, 'middle', 0.9);
  const pGreen = textToVectorPath(fontBarlowSemi, greenText, frontCenterX, greenY + 4.2, 2.65, c.white, 'middle', 0.65);
  const pTagline = textToVectorPath(fontBarlowBold, 'REHYDRATE | REFRESH | RECOVER', frontCenterX, 86.2, 3.2, c.orange, 'middle', 0.75);
  const pStillText = textToVectorPath(fontBarlowSemi, 'STILL | 250 ml', frontCenterX - 1.685, 91.5, 2.7, c.inkMuted, 'middle', 0.5);
  const pStillEmark = getEstimatedSignSvg(frontCenterX + 9.35, 89.4, 2.1, c.inkMuted, 36);
  const pStill = pStillText + '\n' + pStillEmark;

  let outlinedSvg = baseSvg
    .replace(/<g id="front-band-text"[\s\S]*?<\/g>/, `<g id="front-band-text" filter="${isClassic ? 'url(#classic-shadow)' : 'url(#jeera-shadow)'}">\n${pBand1}\n${pBand2}\n</g>`)
    .replace(/<g id="front-green-text"[\s\S]*?<\/g>/, `<g id="front-green-text">\n${pGreen}\n</g>`)
    .replace(/<g id="front-tagline"[\s\S]*?<\/g>/, `<g id="front-tagline">\n${pTagline}\n</g>`)
    .replace(/<g id="front-spec"[\s\S]*?<\/g>/, `<g id="front-spec">\n${pStill}\n</g>`);

  return outlinedSvg;
}

// ============================================================================
// 5. High-Resolution 300 DPI PNG & PDF Export Engine
// ============================================================================
async function exportPngAndPdf(flavor, svgContent) {
  const prefix = `taazu-label-${flavor}`;
  const pngPath = path.join(OUTPUT_DIR, `${prefix}.png`);
  const trimPngPath = path.join(OUTPUT_DIR, `${prefix}-trim.png`);
  const printMarksPngPath = path.join(OUTPUT_DIR, `${prefix}-print.png`);
  const pdfPath = path.join(OUTPUT_DIR, `${prefix}.pdf`);
  const trimPdfPath = path.join(OUTPUT_DIR, `${prefix}-trim.pdf`);
  const marksPdfPath = path.join(OUTPUT_DIR, `${prefix}-marks.pdf`);

  // 1. Render Full Bleed 300 DPI PNG: Exact 2205 x 1193 px
  console.log(`Rendering ${prefix}.png at 2205 x 1193 px (300 DPI)...`);
  const fullBleedBuf = await sharp(Buffer.from(svgContent), { density: 300 })
    .resize(LABEL_SPECS.targetPngWidthPx, LABEL_SPECS.targetPngHeightPx)
    .withMetadata({ density: 300 })
    .png()
    .toBuffer();

  fs.writeFileSync(pngPath, fullBleedBuf);

  // 2. Render Trim Size PNG (Without Bleed): 181 x 95 mm -> 2134 x 1122 px
  const trimWidthPx = Math.round(LABEL_SPECS.targetPngWidthPx * (LABEL_SPECS.trimWidthMm / LABEL_SPECS.canvasWidthMm));
  const trimHeightPx = Math.round(LABEL_SPECS.targetPngHeightPx * (LABEL_SPECS.trimHeightMm / LABEL_SPECS.canvasHeightMm));
  const bleedLeftPx = Math.round(LABEL_SPECS.targetPngWidthPx * (LABEL_SPECS.bleedMm / LABEL_SPECS.canvasWidthMm));
  const bleedTopPx = Math.round(LABEL_SPECS.targetPngHeightPx * (LABEL_SPECS.bleedMm / LABEL_SPECS.canvasHeightMm));

  const trimBuf = await sharp(fullBleedBuf)
    .extract({ left: bleedLeftPx, top: bleedTopPx, width: trimWidthPx, height: trimHeightPx })
    .withMetadata({ density: 300 })
    .png()
    .toBuffer();

  fs.writeFileSync(trimPngPath, trimBuf);

  // 3. Create Print Sheet with Crop Marks & Registration Details
  const marginPx = 90;
  const sheetW = LABEL_SPECS.targetPngWidthPx + marginPx * 2;
  const sheetH = LABEL_SPECS.targetPngHeightPx + marginPx * 2;

  const marksSvg = `
  <svg width="${sheetW}" height="${sheetH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${sheetW}" height="${sheetH}" fill="#FFFFFF"/>
    <!-- Crop Marks for Trim -->
    <g stroke="#111827" stroke-width="2">
      <!-- Top Left -->
      <line x1="${marginPx + bleedLeftPx}" y1="10" x2="${marginPx + bleedLeftPx}" y2="${marginPx - 10}"/>
      <line x1="10" y1="${marginPx + bleedTopPx}" x2="${marginPx - 10}" y2="${marginPx + bleedTopPx}"/>
      <!-- Top Right -->
      <line x1="${marginPx + bleedLeftPx + trimWidthPx}" y1="10" x2="${marginPx + bleedLeftPx + trimWidthPx}" y2="${marginPx - 10}"/>
      <line x1="${sheetW - 10}" y1="${marginPx + bleedTopPx}" x2="${sheetW - marginPx + 10}" y2="${marginPx + bleedTopPx}"/>
      <!-- Bottom Left -->
      <line x1="${marginPx + bleedLeftPx}" y1="${sheetH - 10}" x2="${marginPx + bleedLeftPx}" y2="${sheetH - marginPx + 10}"/>
      <line x1="10" y1="${marginPx + bleedTopPx + trimHeightPx}" x2="${marginPx - 10}" y2="${marginPx + bleedTopPx + trimHeightPx}"/>
      <!-- Bottom Right -->
      <line x1="${marginPx + bleedLeftPx + trimWidthPx}" y1="${sheetH - 10}" x2="${marginPx + bleedLeftPx + trimWidthPx}" y2="${sheetH - marginPx + 10}"/>
      <line x1="${sheetW - 10}" y1="${marginPx + bleedTopPx + trimHeightPx}" x2="${sheetW - marginPx + 10}" y2="${marginPx + bleedTopPx + trimHeightPx}"/>
    </g>
    <!-- Prepress Header -->
    <text x="${sheetW / 2}" y="35" font-family="sans-serif" font-size="18" font-weight="bold" fill="#374151" text-anchor="middle">
      TAAZU — ${flavor.toUpperCase()} LABEL (Trim 181 x 95 mm | Bleed 3 mm | 300 DPI | 250ml PET)
    </text>
  </svg>`;

  const marksBg = await sharp(Buffer.from(marksSvg)).png().toBuffer();
  await sharp(marksBg)
    .composite([{ input: fullBleedBuf, left: marginPx, top: marginPx }])
    .png()
    .toFile(printMarksPngPath);

  // 4. Generate PDF Documents (pdf-lib)
  // 187 x 101 mm page size: 530.08 x 286.30 pt
  const pdfDoc = await PDFDocument.create();
  const pageW = 187 * (72 / 25.4);
  const pageH = 101 * (72 / 25.4);
  const page = pdfDoc.addPage([pageW, pageH]);
  const embeddedPng = await pdfDoc.embedPng(fullBleedBuf);
  page.drawImage(embeddedPng, { x: 0, y: 0, width: pageW, height: pageH });
  fs.writeFileSync(pdfPath, await pdfDoc.save());

  // Trim Size PDF: 181 x 95 mm page size: 513.07 x 269.29 pt
  const trimDoc = await PDFDocument.create();
  const trimPageW = 181 * (72 / 25.4);
  const trimPageH = 95 * (72 / 25.4);
  const trimPage = trimDoc.addPage([trimPageW, trimPageH]);
  const embeddedTrimPng = await trimDoc.embedPng(trimBuf);
  trimPage.drawImage(embeddedTrimPng, { x: 0, y: 0, width: trimPageW, height: trimPageH });
  fs.writeFileSync(trimPdfPath, await trimDoc.save());

  // Marks PDF
  const marksDoc = await PDFDocument.create();
  const marksPngBuf = fs.readFileSync(printMarksPngPath);
  const marksEmbedded = await marksDoc.embedPng(marksPngBuf);
  const marksPageW = sheetW * (72 / 300);
  const marksPageH = sheetH * (72 / 300);
  const marksPage = marksDoc.addPage([marksPageW, marksPageH]);
  marksPage.drawImage(marksEmbedded, { x: 0, y: 0, width: marksPageW, height: marksPageH });
  fs.writeFileSync(marksPdfPath, await marksDoc.save());

  console.log(`Generated: ${pngPath}`);
  console.log(`Generated: ${trimPngPath}`);
  console.log(`Generated: ${pdfPath}`);
}

// ============================================================================
// 6. Interactive Preview HTML (Flat Inspection + 3D Cylinder / Bottle Wrap)
// ============================================================================
function generatePreviewHtml() {
  const previewPath = path.join(OUTPUT_DIR, 'preview.html');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Taazu — Bottle Label Verification &amp; 3D Wrap Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    :root {
      --bg: #F8F9FA;
      --surface: #FFFFFF;
      --cream: #FFF8E7;
      --orange: #E0561B;
      --classic-yellow: #F2D22E;
      --jeera-brown: #8A4B1F;
      --leaf-green: #1F7A3A;
      --ink: #1C1917;
      --muted: #6B7280;
      --border: #E5E7EB;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Plus Jakarta Sans", sans-serif;
      background: var(--bg);
      color: var(--ink);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 14px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand h1 {
      font-family: "Barlow Condensed", sans-serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--orange);
    }
    .badge {
      background: #FEF3C7;
      color: #92400E;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      text-transform: uppercase;
    }
    .controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn-group {
      display: flex;
      background: #F3F4F6;
      border-radius: 8px;
      padding: 3px;
    }
    .btn {
      border: none;
      background: transparent;
      padding: 7px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      color: var(--muted);
      transition: all 0.15s ease;
    }
    .btn.active {
      background: var(--surface);
      color: var(--ink);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    main {
      flex: 1;
      padding: 24px 28px;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 480px;
      gap: 24px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .card-header {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FAFAFA;
    }
    .card-header h2 {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--ink);
    }
    .card-body {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #F4EBD4;
      position: relative;
    }
    #flat-viewer {
      width: 100%;
      max-height: 480px;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.2s ease;
    }
    #canvas-3d-wrap {
      width: 100%;
      height: 520px;
      display: block;
      outline: none;
      background: radial-gradient(circle at 50% 40%, #FFFFFF 0%, #E8E5DF 100%);
      border-radius: 8px;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      padding: 16px;
      background: var(--surface);
      border-top: 1px solid var(--border);
    }
    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .spec-label {
      font-size: 11px;
      color: var(--muted);
      text-transform: uppercase;
      font-weight: 600;
    }
    .spec-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--ink);
      font-family: "JetBrains Mono", monospace;
    }
    .compare-section {
      grid-column: 1 / -1;
      margin-top: 10px;
    }
    .compare-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 16px;
    }
    .compare-card {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .compare-card img {
      width: 100%;
      height: 280px;
      object-fit: cover;
      display: block;
      background: #FFF8E7;
    }
    .compare-card .caption {
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 600;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <h1>TAAZU</h1>
      <span class="badge">Print Prepress &amp; 3D Wrap QA</span>
    </div>
    <div class="controls">
      <div class="btn-group" id="flavor-select">
        <button class="btn active" data-flavor="classic">Classic Nimbu Namak</button>
        <button class="btn" data-flavor="jeera">Jeera Masala</button>
      </div>
      <div class="btn-group" id="view-mode">
        <button class="btn active" data-mode="bleed">Full Bleed (187 x 101 mm)</button>
        <button class="btn" data-mode="trim">Trim Only (181 x 95 mm)</button>
      </div>
    </div>
  </header>

  <main>
    <!-- Left: Flat Vector Label Inspection -->
    <div class="card">
      <div class="card-header">
        <h2 id="flat-title">Flat Vector Label — Classic Nimbu Namak</h2>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn active" id="btn-glue-overlap" style="border: 1px solid var(--border); padding: 4px 10px; font-size: 11px;">Glue Overlap Guide: ON</button>
          <span class="badge" id="flat-dim">2205 x 1193 px (300 DPI)</span>
        </div>
      </div>
      <div class="card-body">
        <div id="flat-stage" style="position: relative; display: inline-block; width: 100%; max-width: 960px; line-height: 0;">
          <img id="flat-viewer" src="taazu-label-classic.png" alt="Taazu Label Flat View" style="width: 100%; display: block; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" />
          <svg id="glue-overlap-overlay" style="position: absolute; pointer-events: none; top: 0; left: 0; width: 100%; height: 100%;" viewBox="0 0 187 101" preserveAspectRatio="none">
            <defs>
              <pattern id="preview-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="4" stroke="#9CA3AF" stroke-width="0.8" opacity="0.6"/>
              </pattern>
            </defs>
            <g id="overlap-content">
              <rect id="overlay-rect" x="176" y="3" width="8" height="95" fill="url(#preview-hatch)" opacity="0.45" />
              <line id="overlay-line" x1="176" y1="3" x2="176" y2="98" stroke="#4B5563" stroke-width="0.5" stroke-dasharray="1.5 1.5" />
              <text id="overlay-text" x="180" y="50.5" font-family="'Inter', sans-serif" font-size="2.0" font-weight="700" fill="#374151" transform="rotate(-90 180 50.5)" text-anchor="middle" letter-spacing="0.5">GLUE OVERLAP AREA (NO TEXT)</text>
            </g>
          </svg>
        </div>
      </div>
      <div class="specs-grid">
        <div class="spec-item">
          <span class="spec-label">Trim Size</span>
          <span class="spec-value">181.0 x 95.0 mm</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Bleed Canvas</span>
          <span class="spec-value">187.0 x 101.0 mm</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Front Panel</span>
          <span class="spec-value">70.0 mm</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Back Panel</span>
          <span class="spec-value">62.0 mm</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Glue Overlap</span>
          <span class="spec-value">8.0 mm (Right)</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Print DPI</span>
          <span class="spec-value">300 DPI</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">FSSAI Font</span>
          <span class="spec-value">Inter 6.5-7.0 pt</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Display Font</span>
          <span class="spec-value">Barlow Condensed</span>
        </div>
      </div>
    </div>

    <!-- Right: 3D Wrapped Cylinder / Bottle Viewer -->
    <div class="card">
      <div class="card-header">
        <h2>3D Bottle Wrap Preview (250 ml PET)</h2>
        <span class="badge">Drag to Rotate</span>
      </div>
      <div style="position: relative; flex: 1;">
        <canvas id="canvas-3d-wrap"></canvas>
      </div>
      <div class="specs-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="spec-item">
          <span class="spec-label">Bottle Diameter</span>
          <span class="spec-value">55.0 mm</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Circumference</span>
          <span class="spec-value">172.8 mm</span>
        </div>
      </div>
    </div>

    <!-- Bottom: Comparison with Approved Reference Photos 09 & 11 -->
    <div class="card compare-section">
      <div class="card-header">
        <h2>Quality Assurance: Side-by-Side Comparison with Approved Creatives</h2>
        <span class="badge">Pixel Precision Check</span>
      </div>
      <div class="compare-grid">
        <div class="compare-card">
          <img src="../../brand-kit/creatives/bottle-renders/09-hero-bottle-a1.jpg" alt="Ref 09 Classic" />
          <div class="caption">
            <span>Reference Photo 09</span>
            <span style="color: #F59E0B;">Approved Target</span>
          </div>
        </div>
        <div class="compare-card">
          <img id="comp-classic-render" src="taazu-label-classic.png" alt="Generated Classic Flat" />
          <div class="caption">
            <span>Our Vector Classic</span>
            <span style="color: #10B981;">Generated Vector</span>
          </div>
        </div>
        <div class="compare-card">
          <img src="../../brand-kit/creatives/bottle-renders/11-jeera-masala-a2.jpg" alt="Ref 11 Jeera" />
          <div class="caption">
            <span>Reference Photo 11</span>
            <span style="color: #F59E0B;">Approved Target</span>
          </div>
        </div>
        <div class="compare-card">
          <img id="comp-jeera-render" src="taazu-label-jeera.png" alt="Generated Jeera Flat" />
          <div class="caption">
            <span>Our Vector Jeera</span>
            <span style="color: #10B981;">Generated Vector</span>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    let currentFlavor = 'classic';
    let currentMode = 'bleed';

    const flatViewer = document.getElementById('flat-viewer');
    const flatTitle = document.getElementById('flat-title');
    const flatDim = document.getElementById('flat-dim');

    function updateFlatViewer() {
      const modeSuffix = currentMode === 'trim' ? '-trim' : '';
      flatViewer.src = 'taazu-label-' + currentFlavor + modeSuffix + '.png';
      flatTitle.textContent = 'Flat Vector Label — ' + (currentFlavor === 'classic' ? 'Classic Nimbu Namak' : 'Jeera Masala');
      flatDim.textContent = currentMode === 'trim' ? '2134 x 1122 px (Trim Size)' : '2205 x 1193 px (300 DPI Bleed)';

      const overlaySvg = document.getElementById('glue-overlap-overlay');
      const overlayRect = document.getElementById('overlay-rect');
      const overlayLine = document.getElementById('overlay-line');
      const overlayText = document.getElementById('overlay-text');
      if (currentMode === 'trim') {
        overlaySvg.setAttribute('viewBox', '0 0 181 95');
        overlayRect.setAttribute('x', '173');
        overlayRect.setAttribute('y', '0');
        overlayRect.setAttribute('width', '8');
        overlayRect.setAttribute('height', '95');
        overlayLine.setAttribute('x1', '173');
        overlayLine.setAttribute('y1', '0');
        overlayLine.setAttribute('x2', '173');
        overlayLine.setAttribute('y2', '95');
        overlayText.setAttribute('x', '177');
        overlayText.setAttribute('y', '47.5');
        overlayText.setAttribute('transform', 'rotate(-90 177 47.5)');
      } else {
        overlaySvg.setAttribute('viewBox', '0 0 187 101');
        overlayRect.setAttribute('x', '176');
        overlayRect.setAttribute('y', '3');
        overlayRect.setAttribute('width', '8');
        overlayRect.setAttribute('height', '95');
        overlayLine.setAttribute('x1', '176');
        overlayLine.setAttribute('y1', '3');
        overlayLine.setAttribute('x2', '176');
        overlayLine.setAttribute('y2', '98');
        overlayText.setAttribute('x', '180');
        overlayText.setAttribute('y', '50.5');
        overlayText.setAttribute('transform', 'rotate(-90 180 50.5)');
      }

      update3DTexture();
    }

    let showGlueGuide = true;
    const btnGlueGuide = document.getElementById('btn-glue-overlap');
    const overlapContent = document.getElementById('overlap-content');
    if (btnGlueGuide && overlapContent) {
      btnGlueGuide.addEventListener('click', () => {
        showGlueGuide = !showGlueGuide;
        overlapContent.style.display = showGlueGuide ? 'block' : 'none';
        btnGlueGuide.textContent = 'Glue Overlap Guide: ' + (showGlueGuide ? 'ON' : 'OFF');
        btnGlueGuide.classList.toggle('active', showGlueGuide);
      });
    }

    document.querySelectorAll('#flavor-select .btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#flavor-select .btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFlavor = btn.dataset.flavor;
        updateFlatViewer();
      });
    });

    document.querySelectorAll('#view-mode .btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#view-mode .btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        updateFlatViewer();
      });
    });

    // Three.js 3D Bottle Wrap Scene
    const canvas = document.getElementById('canvas-3d-wrap');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 7.5, 23);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 12;
    controls.maxDistance = 35;
    controls.target.set(0, 7.5, 0);

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xEDE9FE, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xFFFAF0, 1.3);
    keyLight.position.set(10, 18, 15);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xE0F2FE, 0.9);
    rimLight.position.set(-15, 12, -10);
    scene.add(rimLight);

    // Textures Cache
    const textureLoader = new THREE.TextureLoader();
    const textures = {
      classic: textureLoader.load('taazu-label-classic.png'),
      jeera: textureLoader.load('taazu-label-jeera.png')
    };
    Object.values(textures).forEach(t => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.repeat.x = -1;
    });

    // 250ml Lathe Bottle Assembly
    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);

    const petMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      transmission: 0.96,
      opacity: 1.0,
      transparent: true,
      roughness: 0.05,
      ior: 1.54,
      thickness: 1.2
    });

    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1.8, 0.2),
      new THREE.Vector2(2.75, 0.6),
      new THREE.Vector2(2.75, 3.2),
      new THREE.Vector2(2.6, 5.8),
      new THREE.Vector2(2.6, 7.8),
      new THREE.Vector2(2.75, 10.2),
      new THREE.Vector2(2.5, 12.0),
      new THREE.Vector2(1.8, 13.5),
      new THREE.Vector2(1.4, 14.4),
      new THREE.Vector2(1.4, 15.6),
      new THREE.Vector2(1.2, 15.6)
    ];
    const bottleMesh = new THREE.Mesh(new THREE.LatheGeometry(points, 48), petMat);
    bottleGroup.add(bottleMesh);

    // Liquid Mesh
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xF7D070,
      transmission: 0.75,
      opacity: 0.85,
      transparent: true,
      roughness: 0.15
    });
    const liquidPoints = points.slice(0, 9).map(p => new THREE.Vector2(p.x * 0.96, p.y + 0.15));
    liquidPoints.push(new THREE.Vector2(0, 13.0));
    const liquidMesh = new THREE.Mesh(new THREE.LatheGeometry(liquidPoints, 48), liquidMat);
    bottleGroup.add(liquidMesh);

    // Cap
    const capMat = new THREE.MeshStandardMaterial({ color: 0xE0561B, roughness: 0.4 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.48, 1.5, 36), capMat);
    cap.position.y = 15.15;
    bottleGroup.add(cap);

    // Shrink Sleeve / Wrap Label Cylinder
    const labelMat = new THREE.MeshStandardMaterial({
      map: textures.classic,
      roughness: 0.35,
      metalness: 0.02,
      side: THREE.DoubleSide
    });
    const labelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.76, 2.76, 9.5, 64, 1, true),
      labelMat
    );
    labelMesh.position.y = 6.8;
    labelMesh.rotation.y = Math.PI * 0.35;
    bottleGroup.add(labelMesh);

    function update3DTexture() {
      labelMat.map = textures[currentFlavor];
      liquidMat.color.set(currentFlavor === 'classic' ? 0xF7D070 : 0xBF8236);
      capMat.color.set(currentFlavor === 'classic' ? 0xE0561B : 0x8A4B1F);
      labelMat.needsUpdate = true;
    }

    function animate() {
      requestAnimationFrame(animate);
      bottleGroup.rotation.y += 0.003;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(previewPath, html);
  console.log(`Generated: ${previewPath}`);
}

// ============================================================================
// 7. Technical Prepress README.md
// ============================================================================
function generateReadme() {
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  const content = `# Taazu Bottle Label Specifications (250 ml PET)

This directory contains the production-grade, print-ready vector artwork, high-resolution 300 DPI raster renders, prepress PDF exports, and 3D preview assets for **Taazu** electrolyte drinks.

---

## 1. Physical Mould & Label Dimensions

| Parameter | Specification | Notes |
| :--- | :--- | :--- |
| **Container** | 250 ml PET Bottle | Round profile, body diameter 55 mm |
| **Circumference** | 172.8 mm | $\\pi \\times 55\\text{ mm} \\approx 172.7876\\text{ mm}$ |
| **Trim Size** | **181.0 mm (W) &times; 95.0 mm (H)** | 172.8 mm circumference + 8.0 mm glue overlap |
| **Bleed** | **3.0 mm** on all 4 edges | Canvas extends 3 mm past trim for cutting tolerance |
| **Full Canvas Size** | **187.0 mm (W) &times; 101.0 mm (H)** | Required artboard size for printer RIP |
| **Safe Margin** | **3.0 mm** inside trim line | All critical copy and logos sit within safe boundary |
| **Glue Overlap** | **8.0 mm** on right trim edge | Reserved overlap seam; strictly free of text |
| **Target Print DPI** | **300 DPI** | Exact 2205 &times; 1193 px output |

### Horizontal Panel Breakdown (Trim Coordinates, Left to Right)
\`\`\`
[   BACK PANEL   ] [SIDE] [   FRONT PANEL   ] [   SIDE   ] [OVERLAP]
      62 mm        12 mm        70 mm            29 mm        8 mm
\`\`\`
- Total trim width: $62 + 12 + 70 + 29 + 8 = 181\\text{ mm}$.
- Total canvas width with 3 mm bleed: $187\\text{ mm}$.

---

## 2. Brand Color Palette & Prepress CMYK Conversions

| Color Role | Hex Code | RGB | Approx CMYK (Offset / Flexo) |
| :--- | :--- | :--- | :--- |
| **Cream Canvas** | \`#FFF8E7\` | 255, 248, 231 | C0, M3, Y11, K0 |
| **Taazu Orange** | \`#E0561B\` | 224, 86, 27 | C3, M80, Y98, K0 |
| **Classic Yellow Band** | \`#F2D22E\` | 242, 210, 46 | C6, M13, Y90, K0 |
| **Jeera Masala Brown Band** | \`#8A4B1F\` | 138, 75, 31 | C25, M70, Y95, K30 |
| **Leaf Green Strip** | \`#1F7A3A\` | 31, 122, 58 | C84, M22, Y95, K12 |
| **Body Ink Dark** | \`#1C1917\` | 28, 25, 23 | C65, M65, Y65, K85 |
| **Muted Grey-Brown** | \`#57534E\` | 87, 83, 78 | C55, M50, Y50, K30 |

*Note for prepress printer: Colors must be verified against physical Pantone / proofing swatch under D50 lighting.*

---

## 3. Typography & FSSAI Compliance

- **Flavour Name, Green Strip, Tagline, Volume**: **Barlow Condensed** (SemiBold & Bold, all caps).
- **Back Panel Mandatory Statutory Text**: **Inter** (Regular, Medium, Bold). Minimum size is 6.5 to 7.0 pt, strictly complying with the FSSAI Labelling & Display Regulations (2020) for 250 ml pack sizes.
- **Outlined Vectors**: In \`*-outlined.svg\`, every glyph has been converted into vector \`<path>\` outlines using \`opentype.js\` so that RIP processors and printing plates require no external fonts.

---

## 4. Mandatory Placeholders Checklist (Fill Before Printing)

Before issuing the final print purchase order and making flexo/offset plates, replace the following \`[x]\` placeholders with finalized certified data:

- [ ] **FSSAI Licence Number**: Replace \`[14-digit licence]\` with brand owner / co-packer FSSAI registration number.
- [ ] **Co-packer Manufacturing Details**: Replace \`[co-packer name, address, FSSAI lic.]\`.
- [ ] **Brand Owner Marketing Details**: Replace \`[brand owner name, address]\`.
- [ ] **MRP**: Replace \`₹[xx]\` with retail price.
- [ ] **Customer Care Contacts**: Replace \`[phone]\` and \`[email]\`.
- [ ] **Nutrition Panel Lab Report**: Replace \`[x]\` numbers from NABL-accredited laboratory test report:
  - Energy (kcal)
  - Protein (g)
  - Carbohydrate (g)
  - Total Sugars (g)
  - Added Sugars (g)
  - Total Fat (g)
  - Sodium (mg)
  - Potassium (mg)
- [ ] **Barcode**: Replace \`[8 900000 000000]\` with registered GS1 India EAN-13 barcode.
- [ ] **Ingredients Listing**: Confirm exact descending order of raw materials with formulation chemist.
- [ ] **Vector Logo Artwork**: Replace 1024 px raster logo with vector EPS/AI when final vector redraw is completed.

---

## 5. Output Deliverables Manifest

\`\`\`
brand-kit/labels/
├── taazu-label-classic.svg           # Layered, real editable text
├── taazu-label-classic-outlined.svg  # 100% vector outlines (no fonts needed)
├── taazu-label-classic.png           # 2205 x 1193 px (300 DPI, full bleed)
├── taazu-label-classic-trim.png      # 2134 x 1122 px (Trim size without bleed)
├── taazu-label-classic-print.png     # With prepress crop marks
├── taazu-label-classic.pdf           # 187 x 101 mm full bleed PDF
├── taazu-label-classic-trim.pdf      # 181 x 95 mm trim PDF
├── taazu-label-classic-marks.pdf     # With crop marks & registration details
├── taazu-label-jeera.svg             # Jeera Masala layered editable SVG
├── taazu-label-jeera-outlined.svg    # Jeera Masala outlined vector SVG
├── taazu-label-jeera.png             # 2205 x 1193 px (300 DPI, full bleed)
├── taazu-label-jeera-trim.png        # Trim size without bleed
├── taazu-label-jeera-print.png       # With prepress crop marks
├── taazu-label-jeera.pdf             # 187 x 101 mm full bleed PDF
├── taazu-label-jeera-trim.pdf        # 181 x 95 mm trim PDF
├── taazu-label-jeera-marks.pdf       # With crop marks & registration details
├── preview.html                      # Interactive flat & 3D bottle wrap QA viewer
├── README.md                         # Technical specification & checklist
└── assets/
    ├── taazu-logo-c4-transparent.png
    └── taazu-logo-icon-c2-transparent.png
\`\`\`
`;

  fs.writeFileSync(readmePath, content);
  console.log(`Generated: ${readmePath}`);
}

// ============================================================================
// 8. Main Execution Orchestrator
// ============================================================================
async function run() {
  console.log('--- Starting Taazu Bottle Label Generation ---');

  // Step 1: Process Logos
  console.log('1. Extracting transparent logos (soft-edge unmult & tight trim)...');
  const logoFrontPath = path.join(ASSETS_DIR, 'taazu-logo-c4-transparent.png');
  const logoIconPath = path.join(ASSETS_DIR, 'taazu-logo-icon-c2-transparent.png');

  await createTransparentPng(
    path.join(ROOT_DIR, 'brand-kit', 'logos', 'taazu-logo-white-c4.png'),
    logoFrontPath,
    4,
    60
  );

  await createTransparentPng(
    path.join(ROOT_DIR, 'brand-kit', 'logos', 'taazu-logo-icon-white-c2.png'),
    logoIconPath,
    4,
    60
  );

  const logoFrontUri = fileToDataUri(logoFrontPath);
  const logoIconUri = fileToDataUri(logoIconPath);

  // Step 2: Build SVGs
  console.log('2. Generating editable & outlined SVGs...');
  const classicSvg = generateLabelSvg('classic', { logoFrontUri, logoIconUri });
  const jeeraSvg = generateLabelSvg('jeera', { logoFrontUri, logoIconUri });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'taazu-label-classic.svg'), classicSvg);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'taazu-label-jeera.svg'), jeeraSvg);

  const classicOutlinedSvg = generateOutlinedLabelSvg('classic', { logoFrontUri, logoIconUri });
  const jeeraOutlinedSvg = generateOutlinedLabelSvg('jeera', { logoFrontUri, logoIconUri });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'taazu-label-classic-outlined.svg'), classicOutlinedSvg);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'taazu-label-jeera-outlined.svg'), jeeraOutlinedSvg);

  // Step 3: Export 300 DPI PNGs and Prepress PDFs (using outlined vector paths for prepress precision)
  console.log('3. Exporting 300 DPI PNGs and PDFs...');
  await exportPngAndPdf('classic', classicOutlinedSvg);
  await exportPngAndPdf('jeera', jeeraOutlinedSvg);

  // Step 4: Generate Interactive QA Preview & Readme
  console.log('4. Generating preview.html and README.md...');
  generatePreviewHtml();
  generateReadme();

  console.log('--- All Taazu Label Assets Successfully Generated! ---');
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
