const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Dimensions: 175 mm x 95 mm at ~12 px/mm (2100 x 1140 px, crisp print-ready 300 DPI)
const W = 2100;
const H = 1140;

// Panel widths:
// Total width 2100px:
// Left Panel (Ingredients & Nutrition): x = 0 to 650 (width 650)
// Centre Panel (Front of bottle): x = 650 to 1450 (width 800, centered at 1050)
// Right Panel (Regulatory, Barcode, FSSAI, Batch): x = 1450 to 2100 (width 650)

const LOGO_DROP_SVG = `
<g transform="scale(0.38)">
  <path d="M256 44C236 92 112 200 112 316A144 144 0 0 0 400 316C400 200 276 92 256 44Z" fill="#EA580C"/>
  <circle cx="256" cy="322" r="104" fill="#F5D83B"/>
  <circle cx="256" cy="322" r="91.5" fill="#FFF8E7"/>
  <circle cx="256" cy="322" r="81" fill="#F5D83B"/>
  <line x1="179" y1="290" x2="333" y2="354" stroke="#FFF8E7" stroke-width="7" stroke-linecap="round"/>
  <line x1="224" y1="245" x2="288" y2="399" stroke="#FFF8E7" stroke-width="7" stroke-linecap="round"/>
  <line x1="288" y1="245" x2="224" y2="399" stroke="#FFF8E7" stroke-width="7" stroke-linecap="round"/>
  <line x1="333" y1="290" x2="179" y2="354" stroke="#FFF8E7" stroke-width="7" stroke-linecap="round"/>
  <circle cx="256" cy="322" r="10.5" fill="#FFF8E7"/>
</g>
`;

function buildBarcodeSvg(x, y, w, h) {
  let bars = '';
  const numBars = 36;
  const barW = w / (numBars * 1.5);
  for (let i = 0; i < numBars; i++) {
    const isThick = (i % 3 === 0 || i % 7 === 0);
    const bw = isThick ? barW * 1.6 : barW * 0.9;
    const bx = x + i * (w / numBars);
    bars += `<rect x="${bx.toFixed(1)}" y="${y}" width="${bw.toFixed(1)}" height="${h}" fill="#1C1917"/>`;
  }
  bars += `<text x="${x + w/2}" y="${y + h + 16}" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#44403C" text-anchor="middle" letter-spacing="3">8 901234 567890</text>`;
  return bars;
}

// -----------------------------------------------------------------------------
// 1. CLASSIC NIMBU NAMAK FULL WRAP LABEL (175 mm x 95 mm)
// -----------------------------------------------------------------------------
function buildClassicWrapSvg() {
  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Baloo+Bhai+2:wght@700;800&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap');
      .font-title { font-family: 'Baloo Bhai 2', 'Arial Black', sans-serif; }
      .font-sans { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
    <linearGradient id="yellowBandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#F5D83B"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </linearGradient>
  </defs>

  <!-- Background Cream -->
  <rect width="${W}" height="${H}" fill="#FFF8E7"/>

  <!-- Subtle Trim & Bleed Guides (Dotted line at border) -->
  <rect x="15" y="15" width="${W - 30}" height="${H - 30}" fill="none" stroke="#E7E0CE" stroke-width="1.5" stroke-dasharray="6,6"/>

  <!-- Vertical Panel Dividers (Subtle folding lines) -->
  <line x1="650" y1="30" x2="650" y2="${H - 30}" stroke="#EFE7D4" stroke-width="2" stroke-dasharray="4,8"/>
  <line x1="1450" y1="30" x2="1450" y2="${H - 30}" stroke="#EFE7D4" stroke-width="2" stroke-dasharray="4,8"/>

  <!-- =======================================================================
       LEFT PANEL: INGREDIENTS & NUTRITION TABLE (x: 50 to 600)
       ======================================================================= -->
  <g transform="translate(60, 80)">
    <!-- Header -->
    <text x="0" y="32" class="font-sans" font-size="20" font-weight="800" fill="#1C1917" letter-spacing="1">NUTRITION INFORMATION</text>
    <text x="0" y="58" class="font-sans" font-size="14" font-weight="600" fill="#78716C">Serving Size: 250 ml (1 Bottle) • Servings: 1</text>

    <!-- Nutrition Table Container -->
    <rect x="0" y="78" width="510" height="420" rx="8" fill="#FFFDF8" stroke="#D6D0C0" stroke-width="1.5"/>
    <rect x="0" y="78" width="510" height="44" rx="8" fill="#F6EEDC"/>
    <text x="20" y="106" class="font-sans" font-size="15" font-weight="800" fill="#1C1917">Nutrient Parameter</text>
    <text x="490" y="106" class="font-sans" font-size="15" font-weight="800" fill="#1C1917" text-anchor="end">Per 250 ml</text>

    <!-- Table Rows -->
    ${[
      ['Energy', '38 kcal', false],
      ['Carbohydrates', '9.2 g', false],
      ['Total Natural Sugars', '8.5 g', false],
      ['Added Sugars (Zero refined cane sugar)', '2.0 g', false],
      ['Sodium (as NaCl &amp; Kala Namak)', '240 mg', true],
      ['Potassium (as Potassium Citrate)', '115 mg', true],
      ['Chloride', '310 mg', true],
      ['Vitamin C (from natural lemon)', '25 mg (62% RDA)', false],
      ['Total Fat / Protein', '0.0 g', false],
    ].map((r, i) => {
      const ry = 158 + i * 38;
      const bgHighlight = r[2] ? `<rect x="1" y="${ry - 24}" width="508" height="36" fill="#FEFCE8" opacity="0.8"/>` : '';
      const line = (i < 8) ? `<line x1="15" y1="${ry + 12}" x2="495" y2="${ry + 12}" stroke="#EFE9DC" stroke-width="1"/>` : '';
      return `
        ${bgHighlight}
        <text x="20" y="${ry}" class="font-sans" font-size="14" font-weight="${r[2] ? '700' : '500'}" fill="${r[2] ? '#15803D' : '#44403C'}">${r[0]}</text>
        <text x="490" y="${ry}" class="font-sans" font-size="14" font-weight="700" fill="#1C1917" text-anchor="end">${r[1]}</text>
        ${line}
      `;
    }).join('')}

    <!-- Ingredients Section -->
    <g transform="translate(0, 530)">
      <text x="0" y="24" class="font-sans" font-size="15" font-weight="800" fill="#1C1917" letter-spacing="0.5">INGREDIENTS:</text>
      <text x="0" y="52" class="font-sans" font-size="13.5" font-weight="500" fill="#57534E" line-height="22">
        <tspan x="0" dy="0">Treated Water, Fresh Lemon Juice Reconstituted (6%), Raw Sugar,</tspan>
        <tspan x="0" dy="24">Rock Salt (Sendha Namak), Black Salt (Kala Namak), Potassium Citrate,</tspan>
        <tspan x="0" dy="24">Acidity Regulator (INS 330), Antioxidant (INS 300 - Vitamin C),</tspan>
        <tspan x="0" dy="24">Natural Lemon Extract. CONTAINS NO ARTIFICIAL COLOURS OR SWEETENERS.</tspan>
      </text>

      <!-- Storage & Safety Notice -->
      <rect x="0" y="165" width="510" height="90" rx="8" fill="#FBF6E9" stroke="#E7DFCE" stroke-width="1"/>
      <text x="16" y="195" class="font-sans" font-size="12.5" font-weight="700" fill="#78716C">STORAGE &amp; HANDLING:</text>
      <text x="16" y="218" class="font-sans" font-size="12" font-weight="500" fill="#78716C">
        <tspan x="16" dy="0">Store in a cool, dry place away from direct sunlight. Refrigerate after opening</tspan>
        <tspan x="16" dy="18">and consume within 24 hours. Natural fruit juice may settle — shake gently.</tspan>
      </text>

      <!-- Recyclable PET Mark -->
      <g transform="translate(0, 290)">
        <polygon points="18,0 36,32 0,32" fill="none" stroke="#1F7A3A" stroke-width="2.5"/>
        <text x="18" y="24" class="font-sans" font-size="13" font-weight="800" fill="#1F7A3A" text-anchor="middle">1</text>
        <text x="48" y="18" class="font-sans" font-size="13" font-weight="700" fill="#1F7A3A">100% RECYCLABLE PET BOTTLE</text>
        <text x="48" y="34" class="font-sans" font-size="11.5" font-weight="500" fill="#78716C">Crush bottle after use • Clean Amdavad initiative</text>
      </g>
    </g>
  </g>

  <!-- =======================================================================
       CENTRE FRONT PANEL: BRAND, LOGO, FLAVOUR BAND, GRAPHICS (x: 650 to 1450)
       ======================================================================= -->
  <g transform="translate(1050, 100)" text-anchor="middle">
    <!-- Brand Logo Mark (Water drop with lemon) -->
    <g transform="translate(-75, 10)">
      ${LOGO_DROP_SVG}
    </g>

    <!-- TAAZU Primary Wordmark -->
    <text x="0" y="245" class="font-title" font-size="115" font-weight="800" fill="#EA580C" letter-spacing="4">TAAZU</text>
    <text x="175" y="170" class="font-sans" font-size="22" font-weight="800" fill="#EA580C">™</text>

    <!-- Category Pill -->
    <rect x="-185" y="265" width="370" height="34" rx="17" fill="#FEF3C7"/>
    <text x="0" y="288" class="font-sans" font-size="14" font-weight="800" fill="#B45309" letter-spacing="2">STILL LEMON-SALT ELECTROLYTE</text>

    <!-- Sunny Yellow Flavour Band -->
    <g transform="translate(-320, 325)">
      <rect width="640" height="110" rx="18" fill="url(#yellowBandGrad)" stroke="#EAB308" stroke-width="2"/>
      <text x="320" y="58" class="font-title" font-size="44" font-weight="800" fill="#1C1917" text-anchor="middle" letter-spacing="1">CLASSIC NIMBU NAMAK</text>
      <text x="320" y="92" class="font-sans" font-size="16" font-weight="700" fill="#713F12" text-anchor="middle" letter-spacing="3">क्लासिक निम्बू नमक • 250 ML</text>
    </g>

    <!-- Leaf Green Accent Line -->
    <rect x="-320" y="445" width="640" height="7" rx="3.5" fill="#1F7A3A"/>

    <!-- Tagline: "Paani se aage" -->
    <text x="0" y="495" class="font-title" font-size="36" font-weight="700" fill="#EA580C" letter-spacing="2">PAANI SE AAGE</text>
    <text x="0" y="525" class="font-sans" font-size="16" font-weight="600" fill="#78716C">Hydration backed by science, rooted in desi wisdom</text>

    <!-- Illustrated Lemon Halves & Rock Salt Crystals Graphic -->
    <g transform="translate(0, 600)">
      <!-- Drop Shadow -->
      <ellipse cx="0" cy="50" rx="140" ry="18" fill="#431407" opacity="0.16"/>

      <!-- Lemon Half Center -->
      <circle cx="-35" cy="0" r="42" fill="#F5D83B" stroke="#CA8A04" stroke-width="2"/>
      <circle cx="-35" cy="0" r="36" fill="#FFFBEB"/>
      <circle cx="-35" cy="0" r="31" fill="#FDE047"/>
      <!-- Radiating Segments -->
      ${[0, 45, 90, 135].map(a => `<line x1="-35" y1="0" x2="${-35 + Math.cos(a*Math.PI/180)*31}" y2="${Math.sin(a*Math.PI/180)*31}" stroke="#FFFBEB" stroke-width="2.2"/>
                                   <line x1="-35" y1="0" x2="${-35 - Math.cos(a*Math.PI/180)*31}" y2="${-Math.sin(a*Math.PI/180)*31}" stroke="#FFFBEB" stroke-width="2.2"/>`).join('')}
      <circle cx="-35" cy="0" r="4" fill="#FFFBEB"/>

      <!-- Lemon Wedge Right -->
      <g transform="translate(30, 8) rotate(-15)">
        <path d="M -30 0 A 32 32 0 0 1 30 0 Z" fill="#F5D83B" stroke="#CA8A04" stroke-width="1.8"/>
        <path d="M -26 -2 A 26 26 0 0 1 26 -2 Z" fill="#FFFBEB"/>
        <path d="M -22 -4 A 22 22 0 0 1 22 -4 Z" fill="#FDE047"/>
      </g>

      <!-- Fresh Mint Leaves -->
      <path d="M 50 -15 Q 75 -35 85 -10 Q 75 10 50 -15 Z" fill="#15803D" stroke="#166534" stroke-width="1.5"/>
      <path d="M 50 -15 L 85 -10" stroke="#86EFAC" stroke-width="1" opacity="0.8"/>

      <!-- Pink Rock Salt Crystals -->
      <polygon points="-75,18 -62,8 -66,28 -80,26" fill="#FDA4AF" stroke="#F43F5E" stroke-width="1"/>
      <polygon points="-88,22 -80,14 -76,28 -90,30" fill="#FECDD3" stroke="#FB7185" stroke-width="1"/>
      <polygon points="65,18 78,12 82,28 68,26" fill="#FDA4AF" stroke="#F43F5E" stroke-width="1"/>
      <polygon points="80,24 90,16 92,30 82,32" fill="#F43F5E" stroke="#BE123C" stroke-width="1"/>
    </g>

    <!-- Trio Benefit Badges -->
    <g transform="translate(0, 755)">
      <rect x="-260" y="0" width="520" height="48" rx="24" fill="#FFFDF8" stroke="#E7DFCE" stroke-width="1.5"/>
      <text x="-160" y="30" class="font-sans" font-size="14" font-weight="700" fill="#1C1917">⚡ REHYDRATE</text>
      <text x="-60" y="30" class="font-sans" font-size="14" font-weight="400" fill="#D6D0C0">|</text>
      <text x="0" y="30" class="font-sans" font-size="14" font-weight="700" fill="#1C1917">🌿 REFRESH</text>
      <text x="60" y="30" class="font-sans" font-size="14" font-weight="400" fill="#D6D0C0">|</text>
      <text x="160" y="30" class="font-sans" font-size="14" font-weight="700" fill="#1C1917">🔋 RECOVER</text>
    </g>

    <!-- Bottom Net Quantity and Origin Tag -->
    <text x="0" y="865" class="font-sans" font-size="18" font-weight="800" fill="#1C1917" letter-spacing="3">NET QTY: 250 ml  •  MRP ₹25.00</text>
    <text x="0" y="895" class="font-sans" font-size="13" font-weight="600" fill="#78716C">(INCLUSIVE OF ALL TAXES)  •  SERVE CHILLED</text>
  </g>

  <!-- =======================================================================
       RIGHT PANEL: FSSAI, BATCH/MFG, BARCODE, ORIGIN (x: 1450 to 2100)
       ======================================================================= -->
  <g transform="translate(1520, 80)">
    <!-- FSSAI Statutory Mark Box -->
    <rect x="0" y="0" width="500" height="110" rx="8" fill="#FFFDF8" stroke="#1F7A3A" stroke-width="2"/>
    <rect x="15" y="15" width="130" height="42" rx="4" fill="#1F7A3A"/>
    <text x="80" y="44" class="font-sans" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">fssai</text>
    <text x="165" y="38" class="font-sans" font-size="15" font-weight="700" fill="#1C1917">Lic. No. 10724999000123</text>
    <text x="165" y="60" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">Central FSSAI Standard Compliant</text>
    <text x="16" y="92" class="font-sans" font-size="12" font-weight="600" fill="#1F7A3A">CATEGORY 14.1.4: NON-CARBONATED READY TO DRINK BEVERAGE</text>

    <!-- Batch & Manufacturing Box -->
    <g transform="translate(0, 135)">
      <rect x="0" y="0" width="500" height="230" rx="8" fill="#FFFDF8" stroke="#D6D0C0" stroke-width="1.5"/>
      <rect x="0" y="0" width="500" height="38" rx="8" fill="#F6EEDC"/>
      <text x="20" y="25" class="font-sans" font-size="14" font-weight="800" fill="#1C1917">MANUFACTURING &amp; PRICING DETAILS</text>

      <text x="20" y="70" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">BATCH NO:</text>
      <text x="170" y="70" class="font-mono" font-size="15" font-weight="700" fill="#0369A1">TAZ-CNN-260928</text>

      <text x="20" y="105" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">MFG DATE:</text>
      <text x="170" y="105" class="font-mono" font-size="15" font-weight="700" fill="#1C1917">28 / 09 / 2026</text>

      <text x="20" y="140" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">BEST BEFORE:</text>
      <text x="170" y="140" class="font-mono" font-size="15" font-weight="700" fill="#15803D">6 MONTHS FROM MFG</text>

      <text x="20" y="175" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">MAX RETAIL PRICE:</text>
      <text x="170" y="175" class="font-sans" font-size="16" font-weight="800" fill="#EA580C">₹ 25.00 (₹ 0.10/ml)</text>

      <text x="20" y="208" class="font-sans" font-size="11.5" font-weight="500" fill="#78716C">Incl. of all taxes • For sale in India only</text>
    </g>

    <!-- Barcode Box -->
    <g transform="translate(0, 395)">
      <rect x="0" y="0" width="500" height="155" rx="8" fill="#FFFFFF" stroke="#D6D0C0" stroke-width="1.5"/>
      ${buildBarcodeSvg(65, 25, 370, 75)}
    </g>

    <!-- Manufacturing Address & Made in Ahmedabad Seal -->
    <g transform="translate(0, 580)">
      <rect x="0" y="0" width="500" height="195" rx="8" fill="#FFFDF8" stroke="#D6D0C0" stroke-width="1.5"/>
      <text x="20" y="32" class="font-sans" font-size="14" font-weight="800" fill="#1C1917">MANUFACTURED &amp; MARKETED BY:</text>
      <text x="20" y="60" class="font-sans" font-size="13" font-weight="700" fill="#EA580C">TAAZU BEVERAGES LLP</text>
      <text x="20" y="84" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">
        <tspan x="20" dy="0">Survey No. 412, Changodar Industrial Estate,</tspan>
        <tspan x="20" dy="20">Sarkhej-Bavla Road, Ahmedabad, Gujarat - 382213</tspan>
      </text>

      <line x1="20" y1="122" x2="480" y2="122" stroke="#EFE9DC" stroke-width="1"/>

      <text x="20" y="146" class="font-sans" font-size="12" font-weight="700" fill="#1C1917">CONSUMER CARE &amp; ORDERS:</text>
      <text x="20" y="168" class="font-sans" font-size="12.5" font-weight="700" fill="#15803D">WhatsApp: +91 91737 36652  •  hello@taazu.in</text>
    </g>

    <!-- Made in Ahmedabad Badge -->
    <g transform="translate(250, 840)" text-anchor="middle">
      <circle cx="0" cy="0" r="42" fill="#EA580C"/>
      <circle cx="0" cy="0" r="38" fill="none" stroke="#FFF8E7" stroke-width="1.5"/>
      <text x="0" y="-8" class="font-title" font-size="13" font-weight="800" fill="#FFF8E7" letter-spacing="1">MADE IN</text>
      <text x="0" y="12" class="font-title" font-size="15" font-weight="800" fill="#F5D83B" letter-spacing="1.5">AHMEDABAD</text>
      <text x="0" y="26" class="font-sans" font-size="9" font-weight="700" fill="#FFF8E7">GUJARAT • INDIA</text>
    </g>
  </g>

  <!-- Top / Bottom Shrink Grip Indicator Lines -->
  <line x1="0" y1="20" x2="${W}" y2="20" stroke="#EA580C" stroke-width="3" opacity="0.3"/>
  <line x1="0" y1="${H - 20}" x2="${W}" y2="${H - 20}" stroke="#EA580C" stroke-width="3" opacity="0.3"/>
</svg>
`;
}

// -----------------------------------------------------------------------------
// 2. JEERA MASALA FULL WRAP LABEL (175 mm x 95 mm)
// -----------------------------------------------------------------------------
function buildJeeraWrapSvg() {
  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Baloo+Bhai+2:wght@700;800&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap');
      .font-title { font-family: 'Baloo Bhai 2', 'Arial Black', sans-serif; }
      .font-sans { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
    <linearGradient id="brownBandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9C5627"/>
      <stop offset="50%" stop-color="#8A4B1F"/>
      <stop offset="100%" stop-color="#6F3610"/>
    </linearGradient>
  </defs>

  <!-- Background Cream -->
  <rect width="${W}" height="${H}" fill="#FFF8E7"/>

  <!-- Trim Guides -->
  <rect x="15" y="15" width="${W - 30}" height="${H - 30}" fill="none" stroke="#E7E0CE" stroke-width="1.5" stroke-dasharray="6,6"/>

  <!-- Panel Dividers -->
  <line x1="650" y1="30" x2="650" y2="${H - 30}" stroke="#EFE7D4" stroke-width="2" stroke-dasharray="4,8"/>
  <line x1="1450" y1="30" x2="1450" y2="${H - 30}" stroke="#EFE7D4" stroke-width="2" stroke-dasharray="4,8"/>

  <!-- LEFT PANEL: INGREDIENTS & NUTRITION TABLE -->
  <g transform="translate(60, 80)">
    <text x="0" y="32" class="font-sans" font-size="20" font-weight="800" fill="#1C1917" letter-spacing="1">NUTRITION INFORMATION</text>
    <text x="0" y="58" class="font-sans" font-size="14" font-weight="600" fill="#78716C">Serving Size: 250 ml (1 Bottle) • Servings: 1</text>

    <!-- Table -->
    <rect x="0" y="78" width="510" height="420" rx="8" fill="#FFFDF8" stroke="#D6D0C0" stroke-width="1.5"/>
    <rect x="0" y="78" width="510" height="44" rx="8" fill="#F4EADB"/>
    <text x="20" y="106" class="font-sans" font-size="15" font-weight="800" fill="#1C1917">Nutrient Parameter</text>
    <text x="490" y="106" class="font-sans" font-size="15" font-weight="800" fill="#1C1917" text-anchor="end">Per 250 ml</text>

    ${[
      ['Energy', '40 kcal', false],
      ['Carbohydrates', '9.5 g', false],
      ['Total Natural Sugars', '8.8 g', false],
      ['Added Sugars', '2.0 g', false],
      ['Sodium (as Kala Namak &amp; Sendha)', '260 mg', true],
      ['Potassium (as Potassium Citrate)', '125 mg', true],
      ['Chloride', '330 mg', true],
      ['Cumin Polyphenols (Antioxidants)', '18 mg', false],
      ['Total Fat / Protein', '0.0 g', false],
    ].map((r, i) => {
      const ry = 158 + i * 38;
      const bgHighlight = r[2] ? `<rect x="1" y="${ry - 24}" width="508" height="36" fill="#FEF3C7" opacity="0.6"/>` : '';
      const line = (i < 8) ? `<line x1="15" y1="${ry + 12}" x2="495" y2="${ry + 12}" stroke="#EFE9DC" stroke-width="1"/>` : '';
      return `
        ${bgHighlight}
        <text x="20" y="${ry}" class="font-sans" font-size="14" font-weight="${r[2] ? '700' : '500'}" fill="${r[2] ? '#8A4B1F' : '#44403C'}">${r[0]}</text>
        <text x="490" y="${ry}" class="font-sans" font-size="14" font-weight="700" fill="#1C1917" text-anchor="end">${r[1]}</text>
        ${line}
      `;
    }).join('')}

    <!-- Ingredients Section -->
    <g transform="translate(0, 530)">
      <text x="0" y="24" class="font-sans" font-size="15" font-weight="800" fill="#1C1917" letter-spacing="0.5">INGREDIENTS:</text>
      <text x="0" y="52" class="font-sans" font-size="13.5" font-weight="500" fill="#57534E">
        <tspan x="0" dy="0">Treated Water, Roasted Cumin Extract (Jeera), Fresh Lemon Juice (4%),</tspan>
        <tspan x="0" dy="24">Raw Sugar, Himalayan Black Salt (Kala Namak), Rock Salt (Sendha Namak),</tspan>
        <tspan x="0" dy="24">Potassium Citrate, Black Pepper Extract, Mint Oil, Acidity Regulator (INS 330),</tspan>
        <tspan x="0" dy="24">Antioxidant (INS 300). NO ARTIFICIAL COLOURS OR PRESERVATIVES.</tspan>
      </text>

      <rect x="0" y="165" width="510" height="90" rx="8" fill="#FBF6E9" stroke="#E7DFCE" stroke-width="1"/>
      <text x="16" y="195" class="font-sans" font-size="12.5" font-weight="700" fill="#78716C">STORAGE &amp; HANDLING:</text>
      <text x="16" y="218" class="font-sans" font-size="12" font-weight="500" fill="#78716C">
        <tspan x="16" dy="0">Store in a cool dry place. Keep chilled before drinking for peak flavour.</tspan>
        <tspan x="16" dy="18">Roasted jeera spice particles may settle naturally — shake well.</tspan>
      </text>

      <!-- Recyclable PET -->
      <g transform="translate(0, 290)">
        <polygon points="18,0 36,32 0,32" fill="none" stroke="#8A4B1F" stroke-width="2.5"/>
        <text x="18" y="24" class="font-sans" font-size="13" font-weight="800" fill="#8A4B1F" text-anchor="middle">1</text>
        <text x="48" y="18" class="font-sans" font-size="13" font-weight="700" fill="#8A4B1F">100% RECYCLABLE PET BOTTLE</text>
        <text x="48" y="34" class="font-sans" font-size="11.5" font-weight="500" fill="#78716C">Crush bottle after use • Clean Amdavad initiative</text>
      </g>
    </g>
  </g>

  <!-- CENTRE FRONT PANEL: JEERA MASALA -->
  <g transform="translate(1050, 100)" text-anchor="middle">
    <!-- Logo -->
    <g transform="translate(-75, 10)">
      ${LOGO_DROP_SVG}
    </g>

    <!-- TAAZU Wordmark -->
    <text x="0" y="245" class="font-title" font-size="115" font-weight="800" fill="#EA580C" letter-spacing="4">TAAZU</text>
    <text x="175" y="170" class="font-sans" font-size="22" font-weight="800" fill="#EA580C">™</text>

    <!-- Category Pill -->
    <rect x="-185" y="265" width="370" height="34" rx="17" fill="#FED7AA"/>
    <text x="0" y="288" class="font-sans" font-size="14" font-weight="800" fill="#9A3412" letter-spacing="2">SPICED CUMIN ELECTROLYTE</text>

    <!-- Roasted Jeera Brown Flavour Band -->
    <g transform="translate(-320, 325)">
      <rect width="640" height="110" rx="18" fill="url(#brownBandGrad)" stroke="#6F3610" stroke-width="2"/>
      <text x="320" y="58" class="font-title" font-size="46" font-weight="800" fill="#FFF8E7" text-anchor="middle" letter-spacing="1">JEERA MASALA</text>
      <text x="320" y="92" class="font-sans" font-size="16" font-weight="700" fill="#FED7AA" text-anchor="middle" letter-spacing="3">जीरा मसाला • DESI TWIST • 250 ML</text>
    </g>

    <!-- Warm Golden Yellow Accent Line -->
    <rect x="-320" y="445" width="640" height="7" rx="3.5" fill="#F5D83B"/>

    <!-- Tagline: "Desi twist" -->
    <text x="0" y="495" class="font-title" font-size="36" font-weight="700" fill="#8A4B1F" letter-spacing="2">DESI TWIST</text>
    <text x="0" y="525" class="font-sans" font-size="16" font-weight="600" fill="#78716C">Roasted cumin, kala namak &amp; digestive electrolytes</text>

    <!-- Cumin Seeds & Lemon Illustrations -->
    <g transform="translate(0, 600)">
      <ellipse cx="0" cy="50" rx="140" ry="18" fill="#431407" opacity="0.16"/>

      <!-- Lemon Slice -->
      <g transform="translate(-35, 0)">
        <circle cx="0" cy="0" r="38" fill="#F5D83B" stroke="#CA8A04" stroke-width="2"/>
        <circle cx="0" cy="0" r="32" fill="#FFFBEB"/>
        <circle cx="0" cy="0" r="28" fill="#FDE047"/>
        ${[0, 45, 90, 135].map(a => `<line x1="0" y1="0" x2="${Math.cos(a*Math.PI/180)*28}" y2="${Math.sin(a*Math.PI/180)*28}" stroke="#FFFBEB" stroke-width="2"/>
                                     <line x1="0" y1="0" x2="${-Math.cos(a*Math.PI/180)*28}" y2="${-Math.sin(a*Math.PI/180)*28}" stroke="#FFFBEB" stroke-width="2"/>`).join('')}
      </g>

      <!-- Roasted Cumin Seeds (Illustrated jeera seeds) -->
      ${[
        { x: 30, y: -10, r: 25 },
        { x: 45, y: 5, r: -35 },
        { x: 25, y: 20, r: 60 },
        { x: 55, y: -25, r: -15 },
        { x: -75, y: -5, r: 40 },
        { x: -85, y: 15, r: -20 },
      ].map(s => `
        <g transform="translate(${s.x}, ${s.y}) rotate(${s.r})">
          <ellipse cx="0" cy="0" rx="12" ry="4.5" fill="#8A4B1F" stroke="#5C2D0C" stroke-width="1.2"/>
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#FED7AA" stroke-width="0.8"/>
        </g>
      `).join('')}

      <!-- Black Salt Crystals -->
      <polygon points="55,18 68,10 72,26 58,28" fill="#6B21A8" stroke="#3B0764" stroke-width="1"/>
      <polygon points="70,22 80,14 84,28 72,30" fill="#7E22CE" stroke="#581C87" stroke-width="1"/>
    </g>

    <!-- Trio Badges -->
    <g transform="translate(0, 755)">
      <rect x="-260" y="0" width="520" height="48" rx="24" fill="#FFFDF8" stroke="#E7DFCE" stroke-width="1.5"/>
      <text x="-160" y="30" class="font-sans" font-size="14" font-weight="700" fill="#8A4B1F">🌱 DIGESTION</text>
      <text x="-60" y="30" class="font-sans" font-size="14" font-weight="400" fill="#D6D0C0">|</text>
      <text x="0" y="30" class="font-sans" font-size="14" font-weight="700" fill="#8A4B1F">⚡ ELECTROLYTES</text>
      <text x="60" y="30" class="font-sans" font-size="14" font-weight="400" fill="#D6D0C0">|</text>
      <text x="160" y="30" class="font-sans" font-size="14" font-weight="700" fill="#8A4B1F">🔥 METABOLISM</text>
    </g>

    <text x="0" y="865" class="font-sans" font-size="18" font-weight="800" fill="#1C1917" letter-spacing="3">NET QTY: 250 ml  •  MRP ₹25.00</text>
    <text x="0" y="895" class="font-sans" font-size="13" font-weight="600" fill="#78716C">(INCLUSIVE OF ALL TAXES)  •  SERVE CHILLED</text>
  </g>

  <!-- RIGHT PANEL: REGULATORY -->
  <g transform="translate(1520, 80)">
    <rect x="0" y="0" width="500" height="110" rx="8" fill="#FFFDF8" stroke="#8A4B1F" stroke-width="2"/>
    <rect x="15" y="15" width="130" height="42" rx="4" fill="#8A4B1F"/>
    <text x="80" y="44" class="font-sans" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">fssai</text>
    <text x="165" y="38" class="font-sans" font-size="15" font-weight="700" fill="#1C1917">Lic. No. 10724999000123</text>
    <text x="165" y="60" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">Central FSSAI Standard Compliant</text>
    <text x="16" y="92" class="font-sans" font-size="12" font-weight="600" fill="#8A4B1F">CATEGORY 14.1.4: SPICED ELECTROLYTE BEVERAGE</text>

    <!-- Batch Box -->
    <g transform="translate(0, 135)">
      <rect x="0" y="0" width="500" height="230" rx="8" fill="#FFFDF8" stroke="#D6D0C0" stroke-width="1.5"/>
      <rect x="0" y="0" width="500" height="38" rx="8" fill="#F4EADB"/>
      <text x="20" y="25" class="font-sans" font-size="14" font-weight="800" fill="#1C1917">MANUFACTURING &amp; PRICING DETAILS</text>

      <text x="20" y="70" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">BATCH NO:</text>
      <text x="170" y="70" class="font-mono" font-size="15" font-weight="700" fill="#0369A1">TAZ-JMS-260928</text>

      <text x="20" y="105" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">MFG DATE:</text>
      <text x="170" y="105" class="font-mono" font-size="15" font-weight="700" fill="#1C1917">28 / 09 / 2026</text>

      <text x="20" y="140" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">BEST BEFORE:</text>
      <text x="170" y="140" class="font-mono" font-size="15" font-weight="700" fill="#15803D">6 MONTHS FROM MFG</text>

      <text x="20" y="175" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">MAX RETAIL PRICE:</text>
      <text x="170" y="175" class="font-sans" font-size="16" font-weight="800" fill="#8A4B1F">₹ 25.00 (₹ 0.10/ml)</text>

      <text x="20" y="208" class="font-sans" font-size="11.5" font-weight="500" fill="#78716C">Incl. of all taxes • For sale in India only</text>
    </g>

    <!-- Barcode -->
    <g transform="translate(0, 395)">
      <rect x="0" y="0" width="500" height="155" rx="8" fill="#FFFFFF" stroke="#D6D0C0" stroke-width="1.5"/>
      ${buildBarcodeSvg(65, 25, 370, 75)}
    </g>

    <!-- Manufacturer Details -->
    <g transform="translate(0, 580)">
      <rect x="0" y="0" width="500" height="195" rx="8" fill="#FFFDF8" stroke="#D6D0C0" stroke-width="1.5"/>
      <text x="20" y="32" class="font-sans" font-size="14" font-weight="800" fill="#1C1917">MANUFACTURED &amp; MARKETED BY:</text>
      <text x="20" y="60" class="font-sans" font-size="13" font-weight="700" fill="#8A4B1F">TAAZU BEVERAGES LLP</text>
      <text x="20" y="84" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">
        <tspan x="20" dy="0">Survey No. 412, Changodar Industrial Estate,</tspan>
        <tspan x="20" dy="20">Sarkhej-Bavla Road, Ahmedabad, Gujarat - 382213</tspan>
      </text>

      <line x1="20" y1="122" x2="480" y2="122" stroke="#EFE9DC" stroke-width="1"/>

      <text x="20" y="146" class="font-sans" font-size="12" font-weight="700" fill="#1C1917">CONSUMER CARE &amp; ORDERS:</text>
      <text x="20" y="168" class="font-sans" font-size="12.5" font-weight="700" fill="#8A4B1F">WhatsApp: +91 91737 36652  •  hello@taazu.in</text>
    </g>

    <!-- Seal -->
    <g transform="translate(250, 840)" text-anchor="middle">
      <circle cx="0" cy="0" r="42" fill="#8A4B1F"/>
      <circle cx="0" cy="0" r="38" fill="none" stroke="#FFF8E7" stroke-width="1.5"/>
      <text x="0" y="-8" class="font-title" font-size="13" font-weight="800" fill="#FFF8E7" letter-spacing="1">MADE IN</text>
      <text x="0" y="12" class="font-title" font-size="15" font-weight="800" fill="#F5D83B" letter-spacing="1.5">AHMEDABAD</text>
      <text x="0" y="26" class="font-sans" font-size="9" font-weight="700" fill="#FFF8E7">GUJARAT • INDIA</text>
    </g>
  </g>

  <line x1="0" y1="20" x2="${W}" y2="20" stroke="#8A4B1F" stroke-width="3" opacity="0.3"/>
  <line x1="0" y1="${H - 20}" x2="${W}" y2="${H - 20}" stroke="#8A4B1F" stroke-width="3" opacity="0.3"/>
</svg>
`;
}

// -----------------------------------------------------------------------------
// 3. FRONT LABEL: 3 ALAG STYLE OPTIONS SIDE-BY-SIDE (60 mm x 95 mm each)
// -----------------------------------------------------------------------------
function buildFrontOptionsSvg() {
  const oW = 600;
  const oH = 950;
  const canvasW = 2200;
  const canvasH = 1350;

  return `
<svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Baloo+Bhai+2:wght@700;800&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;display=swap');
      .font-title { font-family: 'Baloo Bhai 2', 'Arial Black', sans-serif; }
      .font-sans { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    </style>
    <!-- Soft Drop Shadow for cards -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#1C1917" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Studio Presentation Backdrop -->
  <rect width="${canvasW}" height="${canvasH}" fill="#F4EFE6"/>

  <!-- Header -->
  <g transform="translate(1100, 100)" text-anchor="middle">
    <text class="font-title" font-size="44" font-weight="800" fill="#1C1917" letter-spacing="1">TAAZU · FRONT LABEL DESIGN CONCEPTS</text>
    <text y="38" class="font-sans" font-size="18" font-weight="600" fill="#78716C">250 ml Slim PET Bottle (60 mm × 95 mm) • 3 Distinct Brand Architecture Options</text>
  </g>

  <!-- =======================================================================
       OPTION 1: MINIMAL & CLEAN (Cream bg, big orange wordmark, yellow tag)
       ======================================================================= -->
  <g transform="translate(140, 220)">
    <!-- Label Card -->
    <rect width="${oW}" height="${oH}" rx="16" fill="#FFF8E7" stroke="#E7DFCE" stroke-width="2" filter="url(#cardShadow)"/>

    <g transform="translate(300, 80)" text-anchor="middle">
      <!-- Water Drop Icon -->
      <g transform="translate(-60, 20)">
        ${LOGO_DROP_SVG}
      </g>

      <!-- Big Orange TAAZU Wordmark -->
      <text x="0" y="240" class="font-title" font-size="96" font-weight="800" fill="#EA580C" letter-spacing="3">TAAZU</text>

      <!-- Yellow Flavour Tag -->
      <rect x="-160" y="275" width="320" height="42" rx="21" fill="#F5D83B"/>
      <text x="0" y="303" class="font-sans" font-size="16" font-weight="800" fill="#1C1917" letter-spacing="1">CLASSIC NIMBU NAMAK</text>

      <!-- Leaf Green Divider Line -->
      <rect x="-80" y="345" width="160" height="4" rx="2" fill="#1F7A3A"/>

      <!-- Clean Minimal Copy -->
      <text x="0" y="420" class="font-sans" font-size="18" font-weight="700" fill="#1C1917">STILL ELECTROLYTE</text>
      <text x="0" y="450" class="font-sans" font-size="14" font-weight="500" fill="#78716C">Himalayan Salt • Real Lemon • Potassium</text>

      <!-- Subtle Geometric Lemon Line Icon -->
      <circle cx="0" cy="560" r="54" fill="none" stroke="#F5D83B" stroke-width="4"/>
      <circle cx="0" cy="560" r="46" fill="#FFFDF8"/>
      <circle cx="0" cy="560" r="38" fill="#FEF08A" opacity="0.6"/>
      ${[0, 45, 90, 135].map(a => `<line x1="0" y1="560" x2="${Math.cos(a*Math.PI/180)*38}" y2="${560 + Math.sin(a*Math.PI/180)*38}" stroke="#FFF8E7" stroke-width="3"/>
                                   <line x1="0" y1="560" x2="${-Math.cos(a*Math.PI/180)*38}" y2="${560 - Math.sin(a*Math.PI/180)*38}" stroke="#FFF8E7" stroke-width="3"/>`).join('')}

      <text x="0" y="690" class="font-title" font-size="28" font-weight="700" fill="#EA580C" letter-spacing="2">PAANI SE AAGE</text>
      <text x="0" y="730" class="font-sans" font-size="13" font-weight="700" fill="#78716C">250 ml • ₹25</text>
    </g>

    <!-- Option Footnote -->
    <text x="300" y="995" class="font-sans" font-size="18" font-weight="800" fill="#1C1917" text-anchor="middle">OPTION 1: MINIMAL &amp; CLEAN</text>
    <text x="300" y="1025" class="font-sans" font-size="13" font-weight="500" fill="#78716C" text-anchor="middle">Clean cream canvas, maximum wordmark prominence</text>
  </g>

  <!-- =======================================================================
       OPTION 2: BOLD & PLAYFUL (Orange bg, cream wordmark, lemon illustration)
       ======================================================================= -->
  <g transform="translate(800, 220)">
    <!-- Label Card (Vibrant Orange Background) -->
    <rect width="${oW}" height="${oH}" rx="16" fill="#EA580C" stroke="#C2410C" stroke-width="2" filter="url(#cardShadow)"/>

    <g transform="translate(300, 80)" text-anchor="middle">
      <!-- Cream Drop Icon -->
      <g transform="translate(-60, 20) scale(0.38)">
        <path d="M256 44C236 92 112 200 112 316A144 144 0 0 0 400 316C400 200 276 92 256 44Z" fill="#FFF8E7"/>
        <circle cx="256" cy="322" r="104" fill="#F5D83B"/>
        <circle cx="256" cy="322" r="91.5" fill="#EA580C"/>
        <circle cx="256" cy="322" r="81" fill="#F5D83B"/>
      </g>

      <!-- Bold Cream TAAZU Wordmark -->
      <text x="0" y="240" class="font-title" font-size="96" font-weight="800" fill="#FFF8E7" letter-spacing="3">TAAZU</text>

      <!-- Yellow Tag -->
      <rect x="-170" y="275" width="340" height="42" rx="21" fill="#F5D83B"/>
      <text x="0" y="303" class="font-sans" font-size="16" font-weight="800" fill="#1C1917" letter-spacing="1">CLASSIC NIMBU NAMAK</text>

      <!-- Big Juicy Sliced Lemon Illustration -->
      <g transform="translate(0, 480)">
        <circle cx="0" cy="0" r="95" fill="#F5D83B" stroke="#FFF8E7" stroke-width="5"/>
        <circle cx="0" cy="0" r="80" fill="#FFF8E7"/>
        <circle cx="0" cy="0" r="70" fill="#FDE047"/>
        ${[0, 30, 60, 90, 120, 150].map(a => `<line x1="0" y1="0" x2="${Math.cos(a*Math.PI/180)*70}" y2="${Math.sin(a*Math.PI/180)*70}" stroke="#FFF8E7" stroke-width="3.5"/>
                                             <line x1="0" y1="0" x2="${-Math.cos(a*Math.PI/180)*70}" y2="${-Math.sin(a*Math.PI/180)*70}" stroke="#FFF8E7" stroke-width="3.5"/>`).join('')}
        <circle cx="0" cy="0" r="10" fill="#FFF8E7"/>
      </g>

      <!-- Recipe Line -->
      <rect x="-195" y="620" width="390" height="42" rx="8" fill="#9A3412"/>
      <text x="0" y="647" class="font-sans" font-size="14.5" font-weight="800" fill="#FED7AA" letter-spacing="1">NIMBU + NAMAK + POTASSIUM</text>

      <text x="0" y="700" class="font-sans" font-size="15" font-weight="700" fill="#FFF8E7">STILL ELECTROLYTE DRINK</text>
      <text x="0" y="730" class="font-sans" font-size="13" font-weight="700" fill="#FED7AA">250 ml • ₹25</text>
    </g>

    <text x="300" y="995" class="font-sans" font-size="18" font-weight="800" fill="#1C1917" text-anchor="middle">OPTION 2: BOLD &amp; PLAYFUL</text>
    <text x="300" y="1025" class="font-sans" font-size="13" font-weight="500" fill="#78716C" text-anchor="middle">All-orange billboard impact, oversized fruit graphic</text>
  </g>

  <!-- =======================================================================
       OPTION 3: DESI RETRO (Cream bg, round stamp-style seal, hand-drawn feel)
       ======================================================================= -->
  <g transform="translate(1460, 220)">
    <!-- Label Card -->
    <rect width="${oW}" height="${oH}" rx="16" fill="#FFF8E7" stroke="#E7DFCE" stroke-width="2" filter="url(#cardShadow)"/>

    <g transform="translate(300, 80)" text-anchor="middle">
      <!-- Retro Stamp Seal -->
      <g transform="translate(0, 140)">
        <circle cx="0" cy="0" r="115" fill="none" stroke="#EA580C" stroke-width="3"/>
        <circle cx="0" cy="0" r="108" fill="none" stroke="#EA580C" stroke-width="1.5" stroke-dasharray="4,4"/>
        <circle cx="0" cy="0" r="75" fill="#EA580C"/>

        <!-- Center Drop Inside Seal -->
        <g transform="translate(-32, -32) scale(0.25)">
          <path d="M256 44C236 92 112 200 112 316A144 144 0 0 0 400 316C400 200 276 92 256 44Z" fill="#FFF8E7"/>
          <circle cx="256" cy="322" r="104" fill="#F5D83B"/>
        </g>

        <!-- Circular Arc Text Mockup -->
        <text x="0" y="-84" class="font-title" font-size="15" font-weight="800" fill="#EA580C" letter-spacing="3">TAAZU • AMDAVAD</text>
        <text x="0" y="96" class="font-title" font-size="15" font-weight="800" fill="#EA580C" letter-spacing="3">PAANI SE AAGE</text>
      </g>

      <!-- Brand Wordmark -->
      <text x="0" y="325" class="font-title" font-size="82" font-weight="800" fill="#EA580C" letter-spacing="3">TAAZU</text>

      <rect x="-160" y="355" width="320" height="38" rx="6" fill="#FFFDF8" stroke="#1F7A3A" stroke-width="2"/>
      <text x="0" y="380" class="font-sans" font-size="15" font-weight="800" fill="#1F7A3A" letter-spacing="1">CLASSIC NIMBU NAMAK</text>

      <!-- Hand-drawn Vintage Botanical Illustrations -->
      <g transform="translate(0, 500)">
        <!-- Engraving style citrus half -->
        <circle cx="0" cy="0" r="48" fill="#FEF08A" stroke="#8A4B1F" stroke-width="2"/>
        <circle cx="0" cy="0" r="40" fill="#FFFDF8" stroke="#8A4B1F" stroke-width="1.2"/>
        ${[0, 45, 90, 135].map(a => `<line x1="0" y1="0" x2="${Math.cos(a*Math.PI/180)*40}" y2="${Math.sin(a*Math.PI/180)*40}" stroke="#8A4B1F" stroke-width="1.2"/>
                                     <line x1="0" y1="0" x2="${-Math.cos(a*Math.PI/180)*40}" y2="${-Math.sin(a*Math.PI/180)*40}" stroke="#8A4B1F" stroke-width="1.2"/>`).join('')}

        <!-- Rock salt shards -->
        <polygon points="-70,18 -55,6 -60,26 -76,24" fill="#FECDD3" stroke="#8A4B1F" stroke-width="1.2"/>
        <polygon points="55,18 70,8 74,28 58,26" fill="#FECDD3" stroke="#8A4B1F" stroke-width="1.2"/>
      </g>

      <!-- Heritage tagline -->
      <text x="0" y="605" class="font-title" font-size="24" font-weight="700" fill="#8A4B1F" letter-spacing="1">ગરમીમાં પણ તાજું</text>
      <text x="0" y="635" class="font-sans" font-size="14" font-weight="600" fill="#78716C">Crafted for the dry heat of Ahmedabad</text>

      <rect x="-140" y="685" width="280" height="34" rx="4" fill="#F6EEDC"/>
      <text x="0" y="707" class="font-mono" font-size="13" font-weight="700" fill="#1C1917">ORIGINAL RECIPE • 250 ML</text>
    </g>

    <text x="300" y="995" class="font-sans" font-size="18" font-weight="800" fill="#1C1917" text-anchor="middle">OPTION 3: DESI RETRO</text>
    <text x="300" y="1025" class="font-sans" font-size="13" font-weight="500" fill="#78716C" text-anchor="middle">Apothecary stamp seal, vintage Gujarati pride</text>
  </g>
</svg>
`;
}

async function renderAllLabels() {
  console.log('Rendering 1: Classic Nimbu Namak Wrap Label (175 mm x 95 mm)...');
  const classicSvg = buildClassicWrapSvg();
  const classicJpg = await sharp(Buffer.from(classicSvg)).jpeg({ quality: 96, mozjpeg: true }).toBuffer();
  fs.writeFileSync('brand-kit/creatives/13-label-classic-wrap.jpg', classicJpg);
  fs.writeFileSync('public/creatives/13-label-classic-wrap.jpg', classicJpg);
  await sharp(classicJpg).png({ compressionLevel: 8 }).toFile('brand-kit/creatives/13-label-classic-wrap.png');
  await sharp(classicJpg).png({ compressionLevel: 8 }).toFile('public/creatives/13-label-classic-wrap.png');
  fs.writeFileSync('brand-kit/creatives/13-label-classic-wrap.svg', classicSvg);
  fs.writeFileSync('public/creatives/13-label-classic-wrap.svg', classicSvg);

  console.log('Rendering 2: Jeera Masala Wrap Label (175 mm x 95 mm)...');
  const jeeraSvg = buildJeeraWrapSvg();
  const jeeraJpg = await sharp(Buffer.from(jeeraSvg)).jpeg({ quality: 96, mozjpeg: true }).toBuffer();
  fs.writeFileSync('brand-kit/creatives/14-label-jeera-wrap.jpg', jeeraJpg);
  fs.writeFileSync('public/creatives/14-label-jeera-wrap.jpg', jeeraJpg);
  await sharp(jeeraJpg).png({ compressionLevel: 8 }).toFile('brand-kit/creatives/14-label-jeera-wrap.png');
  await sharp(jeeraJpg).png({ compressionLevel: 8 }).toFile('public/creatives/14-label-jeera-wrap.png');
  fs.writeFileSync('brand-kit/creatives/14-label-jeera-wrap.svg', jeeraSvg);
  fs.writeFileSync('public/creatives/14-label-jeera-wrap.svg', jeeraSvg);

  console.log('Rendering 3: 3 Front Label Style Options (60 mm x 95 mm each)...');
  const frontSvg = buildFrontOptionsSvg();
  const frontJpg = await sharp(Buffer.from(frontSvg)).jpeg({ quality: 96, mozjpeg: true }).toBuffer();
  fs.writeFileSync('brand-kit/creatives/15-label-front-3options.jpg', frontJpg);
  fs.writeFileSync('public/creatives/15-label-front-3options.jpg', frontJpg);
  await sharp(frontJpg).png({ compressionLevel: 8 }).toFile('brand-kit/creatives/15-label-front-3options.png');
  await sharp(frontJpg).png({ compressionLevel: 8 }).toFile('public/creatives/15-label-front-3options.png');
  fs.writeFileSync('brand-kit/creatives/15-label-front-3options.svg', frontSvg);
  fs.writeFileSync('public/creatives/15-label-front-3options.svg', frontSvg);

  // Also copy to artifacts directory for one-click user download
  const artDir = 'C:/Users/mohit/.gemini/antigravity/brain/7ded5596-7517-4f26-967a-f38d9adbc967';
  fs.copyFileSync('brand-kit/creatives/13-label-classic-wrap.jpg', `${artDir}/taazu_label_classic_wrap.jpg`);
  fs.copyFileSync('brand-kit/creatives/14-label-jeera-wrap.jpg', `${artDir}/taazu_label_jeera_wrap.jpg`);
  fs.copyFileSync('brand-kit/creatives/15-label-front-3options.jpg', `${artDir}/taazu_label_front_3options.jpg`);

  console.log('Successfully generated all 3 packaging labels in JPG, PNG and SVG formats!');
}

renderAllLabels().catch(console.error);
