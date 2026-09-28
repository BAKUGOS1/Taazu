const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const W = 2100;
const H = 1140;

const emblemB64 = fs.readFileSync('scratch/bottle_emblem_clean.png').toString('base64');
const lemonB64 = fs.readFileSync('scratch/lemon_prop_final.png').toString('base64');

// Barcode Generator helper
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

// Helper: Roasted Cumin Seed
function jeeraSeedSvg(cx, cy, angle, scale = 1.0) {
  return `
    <g transform="translate(${cx}, ${cy}) rotate(${angle}) scale(${scale})">
      <ellipse cx="0" cy="0" rx="13" ry="4.5" fill="#8A4B1F" stroke="#451A03" stroke-width="1.2"/>
      <line x1="-9" y1="0" x2="9" y2="0" stroke="#FED7AA" stroke-width="1" stroke-linecap="round"/>
    </g>
  `;
}

// -----------------------------------------------------------------------------
// 1. EXACT CLASSIC NIMBU NAMAK FRONT PANEL (Matching 3D Bottle Render 1:1)
// -----------------------------------------------------------------------------
function buildExactClassicFront(centerX = 1050, topY = 40, panelW = 680) {
  return `
    <g transform="translate(${centerX}, ${topY})" text-anchor="middle">
      <!-- 1. Top Teardrop Emblem (Water drop with lemon slice, mint & ice) -->
      <image href="data:image/png;base64,${emblemB64}" x="-48" y="15" width="96" height="120" preserveAspectRatio="xMidYMid meet"/>

      <!-- 2. Bold Orange TAAZU Wordmark -->
      <text x="0" y="245" class="font-title" font-size="124" font-weight="800" fill="#EA580C" letter-spacing="3">TAAZU</text>
      <text x="195" y="165" class="font-sans" font-size="22" font-weight="800" fill="#EA580C">™</text>

      <!-- 3. Flavour Block: Solid Bright Yellow Band (Spanning across panel) -->
      <g transform="translate(${-panelW / 2}, 285)">
        <rect width="${panelW}" height="185" fill="#FACC15" stroke="#EAB308" stroke-width="2"/>
        <!-- CLASSIC (Line 1) -->
        <text x="${panelW / 2}" y="82" class="font-title" font-size="78" font-weight="800" fill="#FFFFFF" stroke="#854D0E" stroke-width="2.5" paint-order="stroke fill" text-anchor="middle" letter-spacing="2">CLASSIC</text>
        <!-- NIMBU NAMAK (Line 2) -->
        <text x="${panelW / 2}" y="158" class="font-title" font-size="76" font-weight="800" fill="#FFFFFF" stroke="#854D0E" stroke-width="2.5" paint-order="stroke fill" text-anchor="middle" letter-spacing="1">NIMBU NAMAK</text>
      </g>

      <!-- 4. Sub-category Stripe: Rich Dark Forest Green -->
      <g transform="translate(${-panelW / 2}, 470)">
        <rect width="${panelW}" height="56" fill="#15803D" stroke="#166534" stroke-width="1.5"/>
        <text x="${panelW / 2}" y="36" class="font-sans" font-size="23" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="2.5">LEMON-SALT ELECTROLYTE DRINK</text>
      </g>

      <!-- 5. Fresh Ingredients Illustration (Exact cut lemon half, slice & mint from bottle) -->
      <g transform="translate(0, 560)">
        <!-- Center Photographic Cut Lemon + Mint -->
        <image href="data:image/png;base64,${lemonB64}" x="-135" y="0" width="270" height="162" preserveAspectRatio="xMidYMid meet"/>

        <!-- Left floating mint leaf -->
        <g transform="translate(-230, 20) rotate(-25) scale(0.9)">
          <path d="M 0 0 Q 30 -30 65 -15 Q 50 20 0 0 Z" fill="#15803D" stroke="#166534" stroke-width="1.5"/>
          <path d="M 0 0 L 65 -15" stroke="#86EFAC" stroke-width="1.2" opacity="0.8"/>
        </g>

        <!-- Left subtle lemon wedge -->
        <g transform="translate(-240, 140) rotate(20) scale(0.75)">
          <path d="M -40 0 A 40 40 0 0 1 40 0 Z" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
          <path d="M -34 -2 A 34 34 0 0 1 34 -2 Z" fill="#FFFBEB"/>
          <path d="M -28 -4 A 28 28 0 0 1 28 -4 Z" fill="#FEF08A"/>
        </g>

        <!-- Right floating lemon slice -->
        <g transform="translate(230, 80) rotate(15) scale(0.85)">
          <circle cx="0" cy="0" r="42" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
          <circle cx="0" cy="0" r="35" fill="#FFFBEB"/>
          <circle cx="0" cy="0" r="30" fill="#FEF08A"/>
          ${[0, 45, 90, 135].map(a => `<line x1="0" y1="0" x2="${Math.cos(a*Math.PI/180)*30}" y2="${Math.sin(a*Math.PI/180)*30}" stroke="#FFFBEB" stroke-width="2.2"/>
                                       <line x1="0" y1="0" x2="${-Math.cos(a*Math.PI/180)*30}" y2="${-Math.sin(a*Math.PI/180)*30}" stroke="#FFFBEB" stroke-width="2.2"/>`).join('')}
        </g>

        <!-- Right mint leaf -->
        <g transform="translate(210, 150) rotate(35) scale(0.8)">
          <path d="M 0 0 Q 25 -25 55 -10 Q 40 18 0 0 Z" fill="#15803D" stroke="#166534" stroke-width="1.5"/>
          <path d="M 0 0 L 55 -10" stroke="#86EFAC" stroke-width="1.2" opacity="0.8"/>
        </g>
      </g>

      <!-- 6. Brand Triad: REHYDRATE | REFRESH | RECOVER -->
      <text x="0" y="805" class="font-sans" font-size="27" font-weight="800" fill="#D9531E" letter-spacing="3.5">REHYDRATE | REFRESH | RECOVER</text>

      <!-- 7. Footnote Specification: STILL | 250 ml e -->
      <text x="0" y="865" class="font-sans" font-size="26" font-weight="700" fill="#292524" letter-spacing="3">STILL | 250 ml ℮</text>
    </g>
  `;
}

// -----------------------------------------------------------------------------
// 2. EXACT JEERA MASALA FRONT PANEL (Matching 3D Bottle Render 1:1)
// -----------------------------------------------------------------------------
function buildExactJeeraFront(centerX = 1050, topY = 40, panelW = 680) {
  return `
    <g transform="translate(${centerX}, ${topY})" text-anchor="middle">
      <!-- 1. Top Teardrop Emblem -->
      <image href="data:image/png;base64,${emblemB64}" x="-48" y="15" width="96" height="120" preserveAspectRatio="xMidYMid meet"/>

      <!-- 2. Bold Orange TAAZU Wordmark -->
      <text x="0" y="245" class="font-title" font-size="124" font-weight="800" fill="#EA580C" letter-spacing="3">TAAZU</text>
      <text x="195" y="165" class="font-sans" font-size="22" font-weight="800" fill="#EA580C">™</text>

      <!-- 3. Flavour Block: Solid Roasted-Cumin Brown Band -->
      <g transform="translate(${-panelW / 2}, 285)">
        <rect width="${panelW}" height="185" fill="#8A4B1F" stroke="#6F3610" stroke-width="2"/>
        
        <!-- Left Cumin Seed Cluster on Band -->
        ${jeeraSeedSvg(65, 60, -35, 1.2)}
        ${jeeraSeedSvg(85, 95, 20, 1.1)}
        ${jeeraSeedSvg(55, 130, -50, 1.0)}

        <!-- JEERA (Line 1) -->
        <text x="${panelW / 2}" y="82" class="font-title" font-size="82" font-weight="800" fill="#FFFFFF" stroke="#451A03" stroke-width="2.5" paint-order="stroke fill" text-anchor="middle" letter-spacing="3">JEERA</text>
        <!-- MASALA (Line 2) -->
        <text x="${panelW / 2}" y="158" class="font-title" font-size="80" font-weight="800" fill="#FFFFFF" stroke="#451A03" stroke-width="2.5" paint-order="stroke fill" text-anchor="middle" letter-spacing="2">MASALA</text>

        <!-- Right Cumin Seed Cluster on Band -->
        ${jeeraSeedSvg(panelW - 65, 60, 35, 1.2)}
        ${jeeraSeedSvg(panelW - 85, 95, -20, 1.1)}
        ${jeeraSeedSvg(panelW - 55, 130, 50, 1.0)}
      </g>

      <!-- 4. Sub-category Stripe: Rich Dark Forest Green -->
      <g transform="translate(${-panelW / 2}, 470)">
        <rect width="${panelW}" height="56" fill="#15803D" stroke="#166534" stroke-width="1.5"/>
        <text x="${panelW / 2}" y="36" class="font-sans" font-size="23" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="2.5">SPICED CUMIN ELECTROLYTE DRINK</text>
      </g>

      <!-- 5. Fresh Ingredients Illustration & Scattered Cumin Seeds -->
      <g transform="translate(0, 560)">
        <!-- Center Cut Lemon + Mint -->
        <image href="data:image/png;base64,${lemonB64}" x="-135" y="0" width="270" height="162" preserveAspectRatio="xMidYMid meet"/>

        <!-- Scattered Roasted Cumin Seeds surrounding fruit -->
        ${jeeraSeedSvg(-220, 15, -40, 1.2)}
        ${jeeraSeedSvg(-250, 65, 30, 1.1)}
        ${jeeraSeedSvg(-190, 85, -15, 1.3)}
        ${jeeraSeedSvg(-230, 140, 50, 1.0)}

        ${jeeraSeedSvg(220, 20, 45, 1.2)}
        ${jeeraSeedSvg(240, 75, -25, 1.1)}
        ${jeeraSeedSvg(195, 110, 30, 1.3)}
        ${jeeraSeedSvg(235, 150, -40, 1.0)}

        <!-- Bottom right lemon slice -->
        <g transform="translate(230, 140) rotate(15) scale(0.75)">
          <circle cx="0" cy="0" r="38" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
          <circle cx="0" cy="0" r="32" fill="#FFFBEB"/>
          <circle cx="0" cy="0" r="28" fill="#FEF08A"/>
        </g>
      </g>

      <!-- 6. Brand Triad: REHYDRATE | REFRESH | RECOVER -->
      <text x="0" y="805" class="font-sans" font-size="27" font-weight="800" fill="#D9531E" letter-spacing="3.5">REHYDRATE | REFRESH | RECOVER</text>

      <!-- 7. Footnote Specification flanked by Jeera seeds -->
      <g transform="translate(0, 865)">
        ${jeeraSeedSvg(-140, -8, -15, 1.1)}
        <text x="0" y="0" class="font-sans" font-size="26" font-weight="700" fill="#292524" letter-spacing="3">STILL | 250 ml ℮</text>
        ${jeeraSeedSvg(140, -8, 15, 1.1)}
      </g>
    </g>
  `;
}

// -----------------------------------------------------------------------------
// COMPLETE FULL WRAP LABELS (175 mm x 95 mm, 2100 x 1140 px at 300 DPI)
// -----------------------------------------------------------------------------
function buildFullWrapSvg(flavor = 'classic') {
  const isClassic = flavor === 'classic';
  const bandColor = isClassic ? '#FACC15' : '#8A4B1F';
  const frontContent = isClassic ? buildExactClassicFront(1050, 40, 700) : buildExactJeeraFront(1050, 40, 700);

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Baloo+Bhai+2:wght@700;800&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap');
      .font-title { font-family: 'Baloo Bhai 2', 'Arial Black', sans-serif; }
      .font-sans { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
  </defs>

  <!-- Background Cream -->
  <rect width="${W}" height="${H}" fill="#FFF8E7"/>

  <!-- Trim & Bleed Guides -->
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="none" stroke="#E7DFCE" stroke-width="1.5" stroke-dasharray="6,6"/>

  <!-- Fold / Panel Division Lines -->
  <line x1="680" y1="20" x2="680" y2="${H - 20}" stroke="#EFE7D4" stroke-width="2" stroke-dasharray="4,8"/>
  <line x1="1420" y1="20" x2="1420" y2="${H - 20}" stroke="#EFE7D4" stroke-width="2" stroke-dasharray="4,8"/>

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
        ${isClassic ? `
          <tspan x="0" dy="0">Treated Water, Fresh Lemon Juice Reconstituted (6%), Raw Sugar,</tspan>
          <tspan x="0" dy="24">Rock Salt (Sendha Namak), Black Salt (Kala Namak), Potassium Citrate,</tspan>
          <tspan x="0" dy="24">Acidity Regulator (INS 330), Antioxidant (INS 300 - Vitamin C),</tspan>
          <tspan x="0" dy="24">Natural Lemon Extract. CONTAINS NO ARTIFICIAL COLOURS OR SWEETENERS.</tspan>
        ` : `
          <tspan x="0" dy="0">Treated Water, Roasted Cumin Extract (Jeera), Fresh Lemon Juice (4%),</tspan>
          <tspan x="0" dy="24">Raw Sugar, Himalayan Black Salt (Kala Namak), Rock Salt (Sendha Namak),</tspan>
          <tspan x="0" dy="24">Potassium Citrate, Black Pepper Extract, Mint Oil, Acidity Regulator (INS 330),</tspan>
          <tspan x="0" dy="24">Antioxidant (INS 300). NO ARTIFICIAL COLOURS OR PRESERVATIVES.</tspan>
        `}
      </text>

      <!-- Storage & Recyclable Notice -->
      <rect x="0" y="165" width="530" height="95" rx="8" fill="#FBF6E9" stroke="#E7DFCE" stroke-width="1"/>
      <text x="16" y="195" class="font-sans" font-size="12.5" font-weight="700" fill="#78716C">STORAGE &amp; HANDLING:</text>
      <text x="16" y="218" class="font-sans" font-size="12" font-weight="500" fill="#78716C">
        <tspan x="16" dy="0">Store in a cool, dry place. Keep chilled before drinking for peak taste.</tspan>
        <tspan x="16" dy="18">Natural juice &amp; spice particles may settle — shake gently before opening.</tspan>
      </text>

      <g transform="translate(0, 305)">
        <polygon points="18,0 36,32 0,32" fill="none" stroke="#1F7A3A" stroke-width="2.5"/>
        <text x="18" y="24" class="font-sans" font-size="13" font-weight="800" fill="#1F7A3A" text-anchor="middle">1</text>
        <text x="48" y="18" class="font-sans" font-size="13" font-weight="700" fill="#1F7A3A">100% RECYCLABLE PET BOTTLE</text>
        <text x="48" y="34" class="font-sans" font-size="11.5" font-weight="500" fill="#78716C">Crush bottle after use • Clean Amdavad initiative</text>
      </g>
    </g>
  </g>

  <!-- =======================================================================
       CENTRE PANEL: EXACT 1:1 REPLICA OF THE 3D BOTTLE FACE (x: 680 to 1420)
       ======================================================================= -->
  ${frontContent}

  <!-- =======================================================================
       RIGHT PANEL: FSSAI, BATCH/MFG, BARCODE, ADDRESS (x: 1480 to 2040)
       ======================================================================= -->
  <g transform="translate(1480, 75)">
    <!-- FSSAI Mark Box -->
    <rect x="0" y="0" width="540" height="110" rx="8" fill="#FFFDF8" stroke="${isClassic ? '#1F7A3A' : '#8A4B1F'}" stroke-width="2"/>
    <rect x="15" y="15" width="130" height="42" rx="4" fill="${isClassic ? '#1F7A3A' : '#8A4B1F'}"/>
    <text x="80" y="44" class="font-sans" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">fssai</text>
    <text x="165" y="38" class="font-sans" font-size="15" font-weight="700" fill="#1C1917">Lic. No. 10724999000123</text>
    <text x="165" y="60" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">Central FSSAI Standard Compliant</text>
    <text x="16" y="92" class="font-sans" font-size="11.5" font-weight="600" fill="${isClassic ? '#1F7A3A' : '#8A4B1F'}">CATEGORY 14.1.4: NON-CARBONATED READY TO DRINK BEVERAGE</text>

    <!-- Manufacturing & Pricing Box -->
    <g transform="translate(0, 135)">
      <rect x="0" y="0" width="540" height="235" rx="8" fill="#FFFDF8" stroke="#D6D0C0" stroke-width="1.5"/>
      <rect x="0" y="0" width="540" height="38" rx="8" fill="#F6EEDC"/>
      <text x="20" y="25" class="font-sans" font-size="14" font-weight="800" fill="#1C1917">MANUFACTURING &amp; PRICING DETAILS</text>

      <text x="20" y="70" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">BATCH NO:</text>
      <text x="170" y="70" class="font-mono" font-size="15" font-weight="700" fill="#0369A1">${isClassic ? 'TAZ-CNN-260928' : 'TAZ-JMS-260928'}</text>

      <text x="20" y="105" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">MFG DATE:</text>
      <text x="170" y="105" class="font-mono" font-size="15" font-weight="700" fill="#1C1917">28 / 09 / 2026</text>

      <text x="20" y="140" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">BEST BEFORE:</text>
      <text x="170" y="140" class="font-mono" font-size="15" font-weight="700" fill="#15803D">6 MONTHS FROM MFG</text>

      <text x="20" y="175" class="font-sans" font-size="13.5" font-weight="700" fill="#1C1917">MAX RETAIL PRICE:</text>
      <text x="170" y="175" class="font-sans" font-size="16" font-weight="800" fill="#EA580C">₹ 25.00 (₹ 0.10/ml)</text>

      <text x="20" y="210" class="font-sans" font-size="11.5" font-weight="500" fill="#78716C">Incl. of all taxes • For sale in India only</text>
    </g>

    <!-- Barcode Box -->
    <g transform="translate(0, 400)">
      <rect x="0" y="0" width="540" height="160" rx="8" fill="#FFFFFF" stroke="#D6D0C0" stroke-width="1.5"/>
      ${buildBarcodeSvg(85, 25, 370, 80)}
    </g>

    <!-- Manufacturer Address -->
    <g transform="translate(0, 590)">
      <rect x="0" y="0" width="540" height="200" rx="8" fill="#FFFDF8" stroke="#D6D0C0" stroke-width="1.5"/>
      <text x="20" y="32" class="font-sans" font-size="14" font-weight="800" fill="#1C1917">MANUFACTURED &amp; MARKETED BY:</text>
      <text x="20" y="60" class="font-sans" font-size="13.5" font-weight="700" fill="#EA580C">TAAZU BEVERAGES LLP</text>
      <text x="20" y="85" class="font-sans" font-size="12.5" font-weight="500" fill="#57534E">
        <tspan x="20" dy="0">Survey No. 412, Changodar Industrial Estate,</tspan>
        <tspan x="20" dy="20">Sarkhej-Bavla Road, Ahmedabad, Gujarat - 382213</tspan>
      </text>

      <line x1="20" y1="125" x2="520" y2="125" stroke="#EFE9DC" stroke-width="1"/>

      <text x="20" y="150" class="font-sans" font-size="12" font-weight="700" fill="#1C1917">CONSUMER CARE &amp; ORDERS:</text>
      <text x="20" y="172" class="font-sans" font-size="12.5" font-weight="700" fill="#15803D">WhatsApp: +91 91737 36652  •  hello@taazu.in</text>
    </g>

    <!-- Made in Ahmedabad Badge -->
    <g transform="translate(270, 860)" text-anchor="middle">
      <circle cx="0" cy="0" r="44" fill="${isClassic ? '#EA580C' : '#8A4B1F'}"/>
      <circle cx="0" cy="0" r="40" fill="none" stroke="#FFF8E7" stroke-width="1.5"/>
      <text x="0" y="-8" class="font-title" font-size="13" font-weight="800" fill="#FFF8E7" letter-spacing="1">MADE IN</text>
      <text x="0" y="12" class="font-title" font-size="15" font-weight="800" fill="#F5D83B" letter-spacing="1.5">AHMEDABAD</text>
      <text x="0" y="26" class="font-sans" font-size="9" font-weight="700" fill="#FFF8E7">GUJARAT • INDIA</text>
    </g>
  </g>
</svg>
`;
}

// -----------------------------------------------------------------------------
// STANDALONE FRONT LABELS (60 mm x 95 mm, 720 x 1140 px at 300 DPI)
// -----------------------------------------------------------------------------
function buildStandaloneFrontSvg(flavor = 'classic') {
  const fW = 720;
  const fH = 1140;
  const content = (flavor === 'classic') ? buildExactClassicFront(fW / 2, 85, fW - 40) : buildExactJeeraFront(fW / 2, 85, fW - 40);

  return `
<svg width="${fW}" height="${fH}" viewBox="0 0 ${fW} ${fH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Baloo+Bhai+2:wght@700;800&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;display=swap');
      .font-title { font-family: 'Baloo Bhai 2', 'Arial Black', sans-serif; }
      .font-sans { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    </style>
  </defs>

  <rect width="${fW}" height="${fH}" fill="#FFF8E7"/>
  <rect x="8" y="8" width="${fW - 16}" height="${fH - 16}" rx="12" fill="none" stroke="#E7DFCE" stroke-width="1.5"/>

  ${content}
</svg>
`;
}

// -----------------------------------------------------------------------------
// 3 FRONT STYLE CONCEPTS COMPARISON CANVAS (2200 x 1350 px)
// -----------------------------------------------------------------------------
function buildFrontConceptsComparisonSvg() {
  const cW = 2200;
  const cH = 1350;
  const cardW = 600;
  const cardH = 950;

  return `
<svg width="${cW}" height="${cH}" viewBox="0 0 ${cW} ${cH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Baloo+Bhai+2:wght@700;800&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;display=swap');
      .font-title { font-family: 'Baloo Bhai 2', 'Arial Black', sans-serif; }
      .font-sans { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    </style>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#1C1917" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Presentation Canvas Background -->
  <rect width="${cW}" height="${cH}" fill="#F4EFE6"/>

  <!-- Presentation Header -->
  <g transform="translate(1100, 85)" text-anchor="middle">
    <text class="font-title" font-size="46" font-weight="800" fill="#1C1917" letter-spacing="1">TAAZU · FRONT PACKAGING ARCHITECTURE</text>
    <text y="40" class="font-sans" font-size="18" font-weight="600" fill="#78716C">Official Bottle Labels (Exact 3D Production Render) &amp; Brand Style Exploration</text>
  </g>

  <!-- =======================================================================
       OPTION 1: THE EXACT OFFICIAL BOTTLE LABEL (Classic Nimbu Namak)
       ======================================================================= -->
  <g transform="translate(140, 200)">
    <rect width="${cardW}" height="${cardH}" rx="16" fill="#FFF8E7" stroke="#E7DFCE" stroke-width="2" filter="url(#cardShadow)"/>
    
    <!-- Render Exact Bottle Front scaled to fit card -->
    <g transform="scale(0.85) translate(45, 10)">
      ${buildExactClassicFront(cardW / 2, 40, cardW - 40)}
    </g>

    <text x="300" y="1005" class="font-sans" font-size="18" font-weight="800" fill="#1C1917" text-anchor="middle">OPTION 1: OFFICIAL BOTTLE LABEL (CLASSIC)</text>
    <text x="300" y="1035" class="font-sans" font-size="13.5" font-weight="600" fill="#EA580C" text-anchor="middle">Exact 1:1 design used on the 3D bottle prototypes</text>
  </g>

  <!-- =======================================================================
       OPTION 2: THE EXACT OFFICIAL BOTTLE LABEL (Jeera Masala)
       ======================================================================= -->
  <g transform="translate(800, 200)">
    <rect width="${cardW}" height="${cardH}" rx="16" fill="#FFF8E7" stroke="#E7DFCE" stroke-width="2" filter="url(#cardShadow)"/>

    <g transform="scale(0.85) translate(45, 10)">
      ${buildExactJeeraFront(cardW / 2, 40, cardW - 40)}
    </g>

    <text x="300" y="1005" class="font-sans" font-size="18" font-weight="800" fill="#1C1917" text-anchor="middle">OPTION 2: OFFICIAL BOTTLE LABEL (JEERA)</text>
    <text x="300" y="1035" class="font-sans" font-size="13.5" font-weight="600" fill="#8A4B1F" text-anchor="middle">Roasted-cumin brown band, jeera seeds &amp; digestive herbs</text>
  </g>

  <!-- =======================================================================
       OPTION 3: BOLD ALL-ORANGE BILLBOARD VARIANT
       ======================================================================= -->
  <g transform="translate(1460, 200)">
    <rect width="${cardW}" height="${cardH}" rx="16" fill="#EA580C" stroke="#C2410C" stroke-width="2" filter="url(#cardShadow)"/>

    <g transform="translate(300, 70)" text-anchor="middle">
      <image href="data:image/png;base64,${emblemB64}" x="-48" y="20" width="96" height="120" preserveAspectRatio="xMidYMid meet"/>

      <text x="0" y="240" class="font-title" font-size="94" font-weight="800" fill="#FFF8E7" letter-spacing="3">TAAZU</text>

      <rect x="-170" y="275" width="340" height="44" rx="22" fill="#F5D83B"/>
      <text x="0" y="304" class="font-sans" font-size="16" font-weight="800" fill="#1C1917" letter-spacing="1">CLASSIC NIMBU NAMAK</text>

      <!-- Center Lemon Illustration -->
      <g transform="translate(0, 480)">
        <image href="data:image/png;base64,${lemonB64}" x="-120" y="-70" width="240" height="144" preserveAspectRatio="xMidYMid meet"/>
      </g>

      <rect x="-195" y="605" width="390" height="42" rx="8" fill="#9A3412"/>
      <text x="0" y="632" class="font-sans" font-size="14.5" font-weight="800" fill="#FED7AA" letter-spacing="1">NIMBU + NAMAK + POTASSIUM</text>

      <text x="0" y="685" class="font-sans" font-size="18" font-weight="800" fill="#FFF8E7" letter-spacing="2">REHYDRATE | REFRESH | RECOVER</text>
      <text x="0" y="720" class="font-sans" font-size="14" font-weight="700" fill="#FED7AA">STILL • 250 ML • ₹25</text>
    </g>

    <text x="300" y="1005" class="font-sans" font-size="18" font-weight="800" fill="#1C1917" text-anchor="middle">OPTION 3: BOLD ALL-ORANGE VARIANT</text>
    <text x="300" y="1035" class="font-sans" font-size="13.5" font-weight="600" fill="#78716C" text-anchor="middle">High-impact retail shelf standout on solid Taazu orange</text>
  </g>
</svg>
`;
}

async function renderAllExactLabels() {
  console.log('Rendering 1: Exact Classic Nimbu Namak Full Wrap (175 mm x 95 mm)...');
  const classicWrapSvg = buildFullWrapSvg('classic');
  const classicWrapJpg = await sharp(Buffer.from(classicWrapSvg)).jpeg({ quality: 96, mozjpeg: true }).toBuffer();
  fs.writeFileSync('brand-kit/creatives/13-label-classic-wrap.jpg', classicWrapJpg);
  fs.writeFileSync('public/creatives/13-label-classic-wrap.jpg', classicWrapJpg);
  await sharp(classicWrapJpg).png({ compressionLevel: 8 }).toFile('brand-kit/creatives/13-label-classic-wrap.png');
  await sharp(classicWrapJpg).png({ compressionLevel: 8 }).toFile('public/creatives/13-label-classic-wrap.png');
  fs.writeFileSync('brand-kit/creatives/13-label-classic-wrap.svg', classicWrapSvg);
  fs.writeFileSync('public/creatives/13-label-classic-wrap.svg', classicWrapSvg);

  console.log('Rendering 2: Exact Jeera Masala Full Wrap (175 mm x 95 mm)...');
  const jeeraWrapSvg = buildFullWrapSvg('jeera');
  const jeeraWrapJpg = await sharp(Buffer.from(jeeraWrapSvg)).jpeg({ quality: 96, mozjpeg: true }).toBuffer();
  fs.writeFileSync('brand-kit/creatives/14-label-jeera-wrap.jpg', jeeraWrapJpg);
  fs.writeFileSync('public/creatives/14-label-jeera-wrap.jpg', jeeraWrapJpg);
  await sharp(jeeraWrapJpg).png({ compressionLevel: 8 }).toFile('brand-kit/creatives/14-label-jeera-wrap.png');
  await sharp(jeeraWrapJpg).png({ compressionLevel: 8 }).toFile('public/creatives/14-label-jeera-wrap.png');
  fs.writeFileSync('brand-kit/creatives/14-label-jeera-wrap.svg', jeeraWrapSvg);
  fs.writeFileSync('public/creatives/14-label-jeera-wrap.svg', jeeraWrapSvg);

  console.log('Rendering 3: Front Label Architecture Concepts (3 Options)...');
  const frontConceptsSvg = buildFrontConceptsComparisonSvg();
  const frontConceptsJpg = await sharp(Buffer.from(frontConceptsSvg)).jpeg({ quality: 96, mozjpeg: true }).toBuffer();
  fs.writeFileSync('brand-kit/creatives/15-label-front-3options.jpg', frontConceptsJpg);
  fs.writeFileSync('public/creatives/15-label-front-3options.jpg', frontConceptsJpg);
  await sharp(frontConceptsJpg).png({ compressionLevel: 8 }).toFile('brand-kit/creatives/15-label-front-3options.png');
  await sharp(frontConceptsJpg).png({ compressionLevel: 8 }).toFile('public/creatives/15-label-front-3options.png');
  fs.writeFileSync('brand-kit/creatives/15-label-front-3options.svg', frontConceptsSvg);
  fs.writeFileSync('public/creatives/15-label-front-3options.svg', frontConceptsSvg);

  console.log('Rendering 4: Standalone Exact Front Labels (60 mm x 95 mm)...');
  // Classic standalone front
  const classicFrontSvg = buildStandaloneFrontSvg('classic');
  const classicFrontJpg = await sharp(Buffer.from(classicFrontSvg)).jpeg({ quality: 96, mozjpeg: true }).toBuffer();
  fs.writeFileSync('brand-kit/creatives/16-label-classic-front-exact.jpg', classicFrontJpg);
  fs.writeFileSync('public/creatives/16-label-classic-front-exact.jpg', classicFrontJpg);
  await sharp(classicFrontJpg).png({ compressionLevel: 8 }).toFile('brand-kit/creatives/16-label-classic-front-exact.png');
  await sharp(classicFrontJpg).png({ compressionLevel: 8 }).toFile('public/creatives/16-label-classic-front-exact.png');
  fs.writeFileSync('brand-kit/creatives/16-label-classic-front-exact.svg', classicFrontSvg);
  fs.writeFileSync('public/creatives/16-label-classic-front-exact.svg', classicFrontSvg);

  // Jeera standalone front
  const jeeraFrontSvg = buildStandaloneFrontSvg('jeera');
  const jeeraFrontJpg = await sharp(Buffer.from(jeeraFrontSvg)).jpeg({ quality: 96, mozjpeg: true }).toBuffer();
  fs.writeFileSync('brand-kit/creatives/17-label-jeera-front-exact.jpg', jeeraFrontJpg);
  fs.writeFileSync('public/creatives/17-label-jeera-front-exact.jpg', jeeraFrontJpg);
  await sharp(jeeraFrontJpg).png({ compressionLevel: 8 }).toFile('brand-kit/creatives/17-label-jeera-front-exact.png');
  await sharp(jeeraFrontJpg).png({ compressionLevel: 8 }).toFile('public/creatives/17-label-jeera-front-exact.png');
  fs.writeFileSync('brand-kit/creatives/17-label-jeera-front-exact.svg', jeeraFrontSvg);
  fs.writeFileSync('public/creatives/17-label-jeera-front-exact.svg', jeeraFrontSvg);

  // Copy to artifacts directory
  const artDir = 'C:/Users/mohit/.gemini/antigravity/brain/7ded5596-7517-4f26-967a-f38d9adbc967';
  fs.copyFileSync('brand-kit/creatives/13-label-classic-wrap.jpg', `${artDir}/taazu_label_classic_wrap.jpg`);
  fs.copyFileSync('brand-kit/creatives/14-label-jeera-wrap.jpg', `${artDir}/taazu_label_jeera_wrap.jpg`);
  fs.copyFileSync('brand-kit/creatives/15-label-front-3options.jpg', `${artDir}/taazu_label_front_3options.jpg`);
  fs.copyFileSync('brand-kit/creatives/16-label-classic-front-exact.jpg', `${artDir}/taazu_label_classic_front_exact.jpg`);
  fs.copyFileSync('brand-kit/creatives/17-label-jeera-front-exact.jpg', `${artDir}/taazu_label_jeera_front_exact.jpg`);

  console.log('Successfully generated all exact bottle labels in all formats!');
}

renderAllExactLabels().catch(console.error);
