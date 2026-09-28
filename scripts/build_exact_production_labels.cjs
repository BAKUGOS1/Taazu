const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/mohit/.gemini/antigravity/brain/7ded5596-7517-4f26-967a-f38d9adbc967';
const BRAND_KIT_DIR = 'brand-kit/creatives';
const PUBLIC_DIR = 'public/creatives';

// Dimensions
const WRAP_W = 2100;
const WRAP_H = 1140;

const FRONT_W = 720;
const FRONT_H = 1140;

const SHEET_W = 1920;
const SHEET_H = 1200;

async function saveAllFormats(sharpInstance, baseName, artifactName) {
  const jpgBuffer = await sharpInstance.clone().jpeg({ quality: 96 }).toBuffer();
  const pngBuffer = await sharpInstance.clone().png().toBuffer();

  const targets = [
    { dir: BRAND_KIT_DIR, name: baseName },
    { dir: PUBLIC_DIR, name: baseName }
  ];

  for (const t of targets) {
    if (!fs.existsSync(t.dir)) fs.mkdirSync(t.dir, { recursive: true });
    fs.writeFileSync(path.join(t.dir, `${t.name}.jpg`), jpgBuffer);
    fs.writeFileSync(path.join(t.dir, `${t.name}.png`), pngBuffer);
  }

  if (artifactName) {
    if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    fs.writeFileSync(path.join(ARTIFACT_DIR, `${artifactName}.jpg`), jpgBuffer);
    fs.writeFileSync(path.join(ARTIFACT_DIR, `${artifactName}.png`), pngBuffer);
  }
}

function createHorizontalFadeMask(w, h) {
  return Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="horiz" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
          <stop offset="3.5%" stop-color="#FFFFFF" stop-opacity="1"/>
          <stop offset="96.5%" stop-color="#FFFFFF" stop-opacity="1"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#horiz)"/>
    </svg>
  `);
}

// SVG generation for left & right wrap panels
function generateWrapPanelsSvg(flavor = 'classic') {
  const isClassic = flavor === 'classic';

  return `
<svg width="${WRAP_W}" height="${WRAP_H}" viewBox="0 0 ${WRAP_W} ${WRAP_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      .font-mono { font-family: "Courier New", Courier, monospace; }
    </style>
  </defs>

  <!-- Background Cream -->
  <rect width="${WRAP_W}" height="${WRAP_H}" fill="#FFF8E7"/>

  <!-- Trim & Bleed Guides -->
  <rect x="12" y="12" width="${WRAP_W - 24}" height="${WRAP_H - 24}" fill="none" stroke="#E7DFCE" stroke-width="1.5" stroke-dasharray="6,6"/>

  <!-- Fold / Panel Division Lines -->
  <line x1="680" y1="20" x2="680" y2="${WRAP_H - 20}" stroke="#E5DEC9" stroke-width="2" stroke-dasharray="4,8"/>
  <line x1="1420" y1="20" x2="1420" y2="${WRAP_H - 20}" stroke="#E5DEC9" stroke-width="2" stroke-dasharray="4,8"/>

  <!-- =======================================================================
       LEFT PANEL: INGREDIENTS & NUTRITION TABLE (x: 50 to 620)
       ======================================================================= -->
  <g transform="translate(60, 75)">
    <text x="0" y="30" class="font-sans" font-size="20" font-weight="800" fill="#1C1917" letter-spacing="1">NUTRITION INFORMATION</text>
    <text x="0" y="56" class="font-sans" font-size="13.5" font-weight="600" fill="#78716C">Serving Size: 250 ml (1 Bottle) • Servings Per Pack: 1</text>

    <!-- Table -->
    <rect x="0" y="75" width="530" height="430" rx="8" fill="#FFFDF8" stroke="#D6D0C0" stroke-width="1.5"/>
    <rect x="0" y="75" width="530" height="44" rx="8" fill="#F6EEDC"/>
    <text x="20" y="103" class="font-sans" font-size="15" font-weight="800" fill="#1C1917">Nutrient Parameter</text>
    <text x="510" y="103" class="font-sans" font-size="15" font-weight="800" fill="#1C1917" text-anchor="end">Per 250 ml</text>

    ${[
      ['Energy', isClassic ? '38 kcal' : '40 kcal', false],
      ['Carbohydrates', isClassic ? '9.2 g' : '9.5 g', false],
      ['Total Natural Sugars', isClassic ? '8.5 g' : '8.8 g', false],
      ['Added Sugars (Zero refined cane sugar)', '2.0 g', false],
      ['Sodium (as NaCl &amp; Kala Namak)', isClassic ? '240 mg' : '260 mg', true],
      ['Potassium (as Potassium Citrate)', isClassic ? '115 mg' : '125 mg', true],
      ['Chloride', isClassic ? '310 mg' : '330 mg', true],
      [isClassic ? 'Vitamin C (from natural lemon)' : 'Cumin Polyphenols (Antioxidants)', isClassic ? '25 mg (62% RDA)' : '18 mg', false],
      ['Total Fat / Protein', '0.0 g', false],
    ].map((r, i) => {
      const ry = 155 + i * 38;
      const bgHighlight = r[2] ? `<rect x="1" y="${ry - 24}" width="528" height="36" fill="#FEFCE8" opacity="0.8"/>` : '';
      const line = (i < 8) ? `<line x1="15" y1="${ry + 12}" x2="515" y2="${ry + 12}" stroke="#EFE9DC" stroke-width="1"/>` : '';
      return `
        ${bgHighlight}
        <text x="20" y="${ry}" class="font-sans" font-size="14" font-weight="${r[2] ? '700' : '500'}" fill="${r[2] ? '#15803D' : '#44403C'}">${r[0]}</text>
        <text x="510" y="${ry}" class="font-sans" font-size="14" font-weight="700" fill="#1C1917" text-anchor="end">${r[1]}</text>
        ${line}
      `;
    }).join('')}

    <!-- Ingredients Block -->
    <g transform="translate(0, 545)">
      <text x="0" y="24" class="font-sans" font-size="15" font-weight="800" fill="#1C1917" letter-spacing="0.5">INGREDIENTS:</text>
      <text x="0" y="52" class="font-sans" font-size="13" font-weight="500" fill="#57534E">
        ${(isClassic ? [
          'Treated Water, Fresh Lemon Juice Reconstituted (6%), Raw Sugar,',
          'Rock Salt (Sendha Namak), Black Salt (Kala Namak), Potassium Citrate,',
          'Acidity Regulator (INS 330), Antioxidant (INS 300 - Vitamin C),',
          'Natural Lemon Extract. CONTAINS NO ARTIFICIAL COLOURS OR SWEETENERS.'
        ] : [
          'Treated Water, Roasted Cumin Extract (Jeera), Fresh Lemon Juice (4%),',
          'Raw Sugar, Himalayan Black Salt (Kala Namak), Rock Salt (Sendha Namak),',
          'Potassium Citrate, Black Pepper Extract, Mint Oil, Acidity Regulator (INS 330),',
          'Antioxidant (INS 300). NO ARTIFICIAL COLOURS OR PRESERVATIVES.'
        ]).map((line, idx) => `<tspan x="0" dy="${idx === 0 ? 0 : 22}">${line}</tspan>`).join('')}
      </text>
    </g>

    <!-- Storage Instructions -->
    <g transform="translate(0, 680)">
      <rect width="530" height="85" rx="6" fill="#FDFBF5" stroke="#EFE7D4" stroke-width="1"/>
      <text x="18" y="28" class="font-sans" font-size="12" font-weight="700" fill="#78716C" letter-spacing="1">STORAGE &amp; HANDLING:</text>
      <text x="18" y="50" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">Store in a cool, dry place. Keep chilled before drinking for peak taste.</text>
      <text x="18" y="70" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">Natural juice &amp; spice particles may settle — shake gently before opening.</text>
    </g>

    <!-- Recyclable Badge -->
    <g transform="translate(0, 810)">
      <path d="M 22 5 L 42 38 L 2 38 Z" fill="none" stroke="#15803D" stroke-width="2.5" stroke-linejoin="round"/>
      <text x="22" y="32" class="font-sans" font-size="16" font-weight="800" fill="#15803D" text-anchor="middle">1</text>
      <text x="50" y="20" class="font-sans" font-size="13" font-weight="700" fill="#15803D">100% RECYCLABLE PET BOTTLE</text>
      <text x="50" y="36" class="font-sans" font-size="12" font-weight="500" fill="#78716C">Crush bottle after use • Clean Amdavad initiative</text>
    </g>
  </g>

  <!-- =======================================================================
       RIGHT PANEL: FSSAI, BATCH, BARCODE, ADDRESS (x: 1480 to 2040)
       ======================================================================= -->
  <g transform="translate(1480, 75)">
    <!-- FSSAI Box -->
    <rect width="540" height="96" rx="8" fill="#FFFDF8" stroke="#15803D" stroke-width="1.8"/>
    <rect x="18" y="16" width="140" height="64" rx="4" fill="#15803D"/>
    <text x="88" y="58" class="font-sans" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">fssai</text>
    <text x="175" y="44" class="font-sans" font-size="15" font-weight="800" fill="#1C1917">Lic. No. 10724999000123</text>
    <text x="175" y="68" class="font-sans" font-size="12.5" font-weight="600" fill="#78716C">Central FSSAI Standard Compliant</text>
    <text x="18" y="108" class="font-sans" font-size="11" font-weight="700" fill="#15803D">CATEGORY 14.1.4: NON-CARBONATED READY TO DRINK BEVERAGE</text>

    <!-- Manufacturing Box -->
    <g transform="translate(0, 140)">
      <rect width="540" height="205" rx="8" fill="#FDFBF5" stroke="#E5DEC9" stroke-width="1.5"/>
      <rect width="540" height="36" rx="8" fill="#F6EEDC"/>
      <text x="20" y="24" class="font-sans" font-size="13" font-weight="800" fill="#1C1917" letter-spacing="1">MANUFACTURING &amp; PRICING DETAILS</text>

      <text x="20" y="68" class="font-sans" font-size="13.5" font-weight="700" fill="#44403C">BATCH NO:</text>
      <text x="170" y="68" class="font-mono" font-size="14" font-weight="700" fill="#0284C7">${isClassic ? 'TAZ-CNN-260928' : 'TAZ-JMS-260928'}</text>

      <text x="20" y="104" class="font-sans" font-size="13.5" font-weight="700" fill="#44403C">MFG DATE:</text>
      <text x="170" y="104" class="font-sans" font-size="14" font-weight="700" fill="#1C1917">28 / 09 / 2026</text>

      <text x="20" y="140" class="font-sans" font-size="13.5" font-weight="700" fill="#44403C">BEST BEFORE:</text>
      <text x="170" y="140" class="font-sans" font-size="14" font-weight="700" fill="#15803D">6 MONTHS FROM MFG</text>

      <text x="20" y="176" class="font-sans" font-size="13.5" font-weight="700" fill="#44403C">MAX RETAIL PRICE:</text>
      <text x="170" y="176" class="font-sans" font-size="17" font-weight="800" fill="#EA580C">₹ 25.00 (₹ 0.10/ml)</text>

      <text x="20" y="200" class="font-sans" font-size="11" font-weight="500" fill="#78716C">Incl. of all taxes • For sale in India only</text>
    </g>

    <!-- EAN-13 Barcode -->
    <g transform="translate(0, 375)">
      <rect width="540" height="140" rx="8" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="1.5"/>
      <g transform="translate(85, 22)">
        ${[
          3,1,1,2,1,3,1,2,1,1,3,2,1,1,2,3,1,2,1,1,2,1,3,1,1,2,1,3,2,1,1,2,3,1,2,1,1,3,1,2
        ].map((w, i) => {
          const bx = i * 9.2;
          return `<rect x="${bx}" y="0" width="${w * 1.5}" height="70" fill="#1C1917"/>`;
        }).join('')}
        <text x="185" y="94" class="font-mono" font-size="16" font-weight="700" fill="#1C1917" letter-spacing="4">8 901234 567890</text>
      </g>
    </g>

    <!-- Manufacturer & Customer Care -->
    <g transform="translate(0, 545)">
      <rect width="540" height="175" rx="8" fill="#FFFDF8" stroke="#E5DEC9" stroke-width="1.5"/>
      <text x="20" y="32" class="font-sans" font-size="13" font-weight="800" fill="#1C1917" letter-spacing="1">MANUFACTURED &amp; MARKETED BY:</text>
      <text x="20" y="60" class="font-sans" font-size="14" font-weight="700" fill="#D9531E">TAAZU BEVERAGES LLP</text>
      <text x="20" y="84" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">Survey No. 412, Changodar Industrial Estate,</text>
      <text x="20" y="104" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">Sarkhej-Bavla Road, Ahmedabad, Gujarat - 382213</text>

      <line x1="20" y1="124" x2="520" y2="124" stroke="#EFE7D4" stroke-width="1"/>

      <text x="20" y="146" class="font-sans" font-size="11.5" font-weight="700" fill="#78716C" letter-spacing="0.5">CONSUMER CARE &amp; ORDERS:</text>
      <text x="20" y="168" class="font-sans" font-size="12.5" font-weight="600" fill="#15803D">WhatsApp: +91 91737 36652 • hello@taazu.in</text>
    </g>

    <!-- Made in Ahmedabad Badge -->
    <g transform="translate(270, 785)">
      <circle cx="0" cy="0" r="48" fill="none" stroke="#8A4B1F" stroke-width="2.5" stroke-dasharray="4,3"/>
      <circle cx="0" cy="0" r="43" fill="#FFFBEB" stroke="#8A4B1F" stroke-width="1.5"/>
      <text x="0" y="-8" class="font-sans" font-size="12" font-weight="900" fill="#8A4B1F" text-anchor="middle" letter-spacing="1.5">MADE IN</text>
      <text x="0" y="10" class="font-sans" font-size="14.5" font-weight="900" fill="#EA580C" text-anchor="middle" letter-spacing="1">AHMEDABAD</text>
      <text x="0" y="26" class="font-sans" font-size="9" font-weight="700" fill="#8A4B1F" text-anchor="middle" letter-spacing="2">GUJARAT • INDIA</text>
    </g>
  </g>
</svg>
`;
}

async function buildLabels() {
  console.log('--- Step 1: Processing Exact Bottle Labels ---');
  
  // Clean raw bottle front extractions
  // Bottle 09 Classic label: left: 295, top: 428, width: 305, height: 586
  // Bottle 11 Jeera label: left: 295, top: 428, width: 305, height: 586
  const classicRaw = await sharp('brand-kit/creatives/09-hero-bottle-a1.jpg')
    .extract({ left: 295, top: 428, width: 305, height: 586 })
    .png()
    .toBuffer();

  const jeeraRaw = await sharp('brand-kit/creatives/11-jeera-masala-a2.jpg')
    .extract({ left: 295, top: 428, width: 305, height: 586 })
    .png()
    .toBuffer();

  // Upscale to high-res
  const targetLabelH = 1040;
  const targetLabelW = Math.round((305 / 586) * targetLabelH); // ~541

  const classicResized = await sharp(classicRaw)
    .resize(targetLabelW, targetLabelH, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const jeeraResized = await sharp(jeeraRaw)
    .resize(targetLabelW, targetLabelH, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  // Feather mask for soft seamless edges in full wrap
  const fadeMaskBuf = await sharp(createHorizontalFadeMask(targetLabelW, targetLabelH)).png().toBuffer();

  const classicFeathered = await sharp(classicResized)
    .composite([{ input: fadeMaskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const jeeraFeathered = await sharp(jeeraResized)
    .composite([{ input: fadeMaskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();

  console.log(`Rescaled bottle label assets to ${targetLabelW} x ${targetLabelH}`);

  // =========================================================================
  // 1. STANDALONE EXACT FRONT LABELS (60 mm x 95 mm, 720 x 1140 px at 300 DPI)
  // =========================================================================
  console.log('--- Step 2: Generating Standalone Exact Front Labels (16 & 17) ---');

  const cardBorderSvg = `
    <svg width="${FRONT_W}" height="${FRONT_H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="${FRONT_W - 12}" height="${FRONT_H - 12}" rx="20" fill="none" stroke="#E2DAC6" stroke-width="2"/>
      <rect x="16" y="16" width="${FRONT_W - 32}" height="${FRONT_H - 32}" rx="16" fill="none" stroke="#EFE9DC" stroke-width="1" stroke-dasharray="6,6"/>
    </svg>
  `;
  const borderBuf = await sharp(Buffer.from(cardBorderSvg)).png().toBuffer();

  const labelLeft = Math.round((FRONT_W - targetLabelW) / 2);
  const labelTop = Math.round((FRONT_H - targetLabelH) / 2);

  // Classic Front (16)
  const classicFront = sharp({
    create: {
      width: FRONT_W,
      height: FRONT_H,
      channels: 4,
      background: { r: 247, g: 242, b: 230, alpha: 1 } // Exact warm cream tone
    }
  })
  .composite([
    { input: classicResized, left: labelLeft, top: labelTop },
    { input: borderBuf, left: 0, top: 0 }
  ]);

  await saveAllFormats(classicFront, '16-label-classic-front-exact', 'taazu_label_classic_front_exact');
  console.log('Saved 16-label-classic-front-exact in all formats');

  // Jeera Front (17)
  const jeeraFront = sharp({
    create: {
      width: FRONT_W,
      height: FRONT_H,
      channels: 4,
      background: { r: 247, g: 242, b: 230, alpha: 1 }
    }
  })
  .composite([
    { input: jeeraResized, left: labelLeft, top: labelTop },
    { input: borderBuf, left: 0, top: 0 }
  ]);

  await saveAllFormats(jeeraFront, '17-label-jeera-front-exact', 'taazu_label_jeera_front_exact');
  console.log('Saved 17-label-jeera-front-exact in all formats');

  // =========================================================================
  // 2. COMPLETE PRODUCTION FULL WRAP LABELS (175 mm x 95 mm, 2100 x 1140 px)
  // =========================================================================
  console.log('--- Step 3: Generating Production Wrap Labels (13 & 14) ---');

  // Center panel x is 680 to 1420 (width 740, midpoint 1050)
  const wrapLabelLeft = Math.round(1050 - targetLabelW / 2);
  const wrapLabelTop = Math.round((WRAP_H - targetLabelH) / 2);

  // Wrap 13: Classic Nimbu Namak
  const classicWrapSvg = generateWrapPanelsSvg('classic');
  const classicWrapBase = await sharp(Buffer.from(classicWrapSvg)).png().toBuffer();

  const classicWrapFinal = sharp(classicWrapBase)
    .composite([
      { input: classicFeathered, left: wrapLabelLeft, top: wrapLabelTop }
    ]);

  await saveAllFormats(classicWrapFinal, '13-label-classic-wrap', 'taazu_label_classic_wrap');
  console.log('Saved 13-label-classic-wrap in all formats');

  // Wrap 14: Jeera Masala
  const jeeraWrapSvg = generateWrapPanelsSvg('jeera');
  const jeeraWrapBase = await sharp(Buffer.from(jeeraWrapSvg)).png().toBuffer();

  const jeeraWrapFinal = sharp(jeeraWrapBase)
    .composite([
      { input: jeeraFeathered, left: wrapLabelLeft, top: wrapLabelTop }
    ]);

  await saveAllFormats(jeeraWrapFinal, '14-label-jeera-wrap', 'taazu_label_jeera_wrap');
  console.log('Saved 14-label-jeera-wrap in all formats');

  // =========================================================================
  // 3. FRONT ARCHITECTURE CONCEPTS (3 OPTIONS) (1920 x 1200 px)
  // =========================================================================
  console.log('--- Step 4: Generating 3 Options Style Sheet (15) ---');

  const optW = 490;
  const optH = 770;
  const classicFrontBuf = await classicFront.clone().png().toBuffer();
  const jeeraFrontBuf = await jeeraFront.clone().png().toBuffer();

  const colClassic = await sharp(classicFrontBuf)
    .resize(optW, optH, { fit: 'contain' })
    .png()
    .toBuffer();

  const colJeera = await sharp(jeeraFrontBuf)
    .resize(optW, optH, { fit: 'contain' })
    .png()
    .toBuffer();

  // Option 3: Bold Orange Variant
  const opt3Svg = `
    <svg width="${optW}" height="${optH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradOrg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#EA580C"/>
          <stop offset="100%" stop-color="#C2410C"/>
        </linearGradient>
        <style>
          .font-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
          .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
        </style>
      </defs>
      <rect width="${optW}" height="${optH}" rx="18" fill="url(#gradOrg)"/>
      <rect x="8" y="8" width="${optW - 16}" height="${optH - 16}" rx="14" fill="none" stroke="#FED7AA" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>

      <!-- Wordmark -->
      <g transform="translate(${optW / 2}, 160)" text-anchor="middle">
        <text x="0" y="0" class="font-title" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="3">TAAZU</text>
        <rect x="-140" y="32" width="280" height="34" rx="17" fill="#FACC15"/>
        <text x="0" y="55" class="font-sans" font-size="14" font-weight="800" fill="#1C1917" letter-spacing="1">CLASSIC NIMBU NAMAK</text>
      </g>

      <!-- Center Feature Block -->
      <g transform="translate(${optW / 2}, 440)" text-anchor="middle">
        <circle cx="0" cy="0" r="105" fill="#FFFFFF" opacity="0.15"/>
        <circle cx="0" cy="0" r="85" fill="#FFFFFF" opacity="0.2"/>
        <text x="0" y="8" class="font-sans" font-size="18" font-weight="800" fill="#FFFFFF" letter-spacing="1.5">LEMON-SALT</text>
        <text x="0" y="32" class="font-sans" font-size="14" font-weight="700" fill="#FEF08A">ELECTROLYTE DRINK</text>
      </g>

      <!-- Bottom Specs -->
      <g transform="translate(${optW / 2}, 660)" text-anchor="middle">
        <rect x="-160" y="-20" width="320" height="36" rx="6" fill="#000000" opacity="0.2"/>
        <text x="0" y="4" class="font-sans" font-size="13" font-weight="800" fill="#FFFFFF" letter-spacing="1.5">NIMBU + NAMAK + POTASSIUM</text>
        <text x="0" y="48" class="font-sans" font-size="15" font-weight="800" fill="#FFFFFF" letter-spacing="2">REHYDRATE | REFRESH | RECOVER</text>
        <text x="0" y="76" class="font-sans" font-size="13" font-weight="600" fill="#FED7AA">STILL • 250 ML • ₹25</text>
      </g>
    </svg>
  `;
  const colOpt3 = await sharp(Buffer.from(opt3Svg)).png().toBuffer();

  // Sheet background & headers
  const sheetHeaderSvg = `
    <svg width="${SHEET_W}" height="${SHEET_H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .font-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
          .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
        </style>
      </defs>
      <rect width="${SHEET_W}" height="${SHEET_H}" fill="#F4EFE6"/>

      <!-- Header -->
      <g transform="translate(${SHEET_W / 2}, 85)" text-anchor="middle">
        <text x="0" y="0" class="font-title" font-size="44" font-weight="900" fill="#1C1917" letter-spacing="2">TAAZU • PACKAGING LABEL ARCHITECTURE</text>
        <text x="0" y="34" class="font-sans" font-size="17" font-weight="600" fill="#78716C">Official Bottle Labels (Exact 3D Production Render) &amp; Brand Style Exploration</text>
      </g>

      <!-- Column Labels -->
      <g transform="translate(130, 990)">
        <text x="${optW / 2}" y="24" class="font-sans" font-size="17" font-weight="800" fill="#1C1917" text-anchor="middle">OPTION 1: OFFICIAL BOTTLE LABEL (CLASSIC)</text>
        <text x="${optW / 2}" y="48" class="font-sans" font-size="13" font-weight="600" fill="#78716C" text-anchor="middle">Exact 1:1 design used on the 3D bottle prototypes</text>
      </g>

      <g transform="translate(715, 990)">
        <text x="${optW / 2}" y="24" class="font-sans" font-size="17" font-weight="800" fill="#1C1917" text-anchor="middle">OPTION 2: OFFICIAL BOTTLE LABEL (JEERA)</text>
        <text x="${optW / 2}" y="48" class="font-sans" font-size="13" font-weight="600" fill="#78716C" text-anchor="middle">Roasted-cumin brown band, jeera seeds &amp; digestive herbs</text>
      </g>

      <g transform="translate(1300, 990)">
        <text x="${optW / 2}" y="24" class="font-sans" font-size="17" font-weight="800" fill="#1C1917" text-anchor="middle">OPTION 3: BOLD ALL-ORANGE VARIANT</text>
        <text x="${optW / 2}" y="48" class="font-sans" font-size="13" font-weight="600" fill="#78716C" text-anchor="middle">High-impact retail shelf standout on solid Taazu orange</text>
      </g>
    </svg>
  `;
  const sheetHeaderBuf = await sharp(Buffer.from(sheetHeaderSvg)).png().toBuffer();

  const sheetComposite = sharp(sheetHeaderBuf)
    .composite([
      { input: colClassic, left: 130, top: 165 },
      { input: colJeera, left: 715, top: 165 },
      { input: colOpt3, left: 1300, top: 165 }
    ]);

  await saveAllFormats(sheetComposite, '15-label-front-3options', 'taazu_label_front_3options');
  console.log('Saved 15-label-front-3options in all formats');

  console.log('=== All exact label assets successfully built and saved! ===');
}

buildLabels().catch(console.error);
