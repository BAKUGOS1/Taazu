const sharp = require('sharp');
const fs = require('fs');

function generatePhotorealisticIceBed(width = 1600, height = 1200, baseY = 1030) {
  let seed = 12345;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  let svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Ice Body Gradient: Translucent warm frosty glass catching studio orange bounce -->
    <linearGradient id="iceFacet1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="40%" stop-color="#F8FAFC" stop-opacity="0.75"/>
      <stop offset="70%" stop-color="#FED7AA" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0.25"/>
    </linearGradient>

    <linearGradient id="iceFacet2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#E2E8F0" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#C2410C" stop-opacity="0.3"/>
    </linearGradient>

    <linearGradient id="iceFrost" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#FED7AA" stop-opacity="0.1"/>
    </linearGradient>

    <!-- Floor contact shadow under ice -->
    <radialGradient id="iceShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B1104" stop-opacity="0.5"/>
      <stop offset="60%" stop-color="#7C2D12" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <g id="ice-layer">
    <!-- 1. Soft Bed of Shaved Ice / Frost Mist -->
    <ellipse cx="800" cy="${baseY + 10}" rx="540" ry="42" fill="url(#iceFrost)" opacity="0.65"/>
    <ellipse cx="530" cy="${baseY + 8}" rx="220" ry="32" fill="url(#iceFrost)" opacity="0.85"/>
    <ellipse cx="1070" cy="${baseY + 8}" rx="220" ry="32" fill="url(#iceFrost)" opacity="0.85"/>
  `;

  // 2. Generate 120 crystalline ice chunks with multifaceted organic polygons
  const chunks = [];
  // Clustered around left bottle (x: 350-700), right bottle (x: 900-1250), and center bridge (x: 700-900)
  for (let i = 0; i < 140; i++) {
    let cx, cy, size;
    const r = rand();
    if (r < 0.42) {
      // Left bottle cluster
      cx = 530 + (rand() - 0.5) * 360;
      cy = baseY + (rand() - 0.4) * 65;
    } else if (r < 0.84) {
      // Right bottle cluster
      cx = 1070 + (rand() - 0.5) * 360;
      cy = baseY + (rand() - 0.4) * 65;
    } else {
      // Center connecting ice
      cx = 800 + (rand() - 0.5) * 220;
      cy = baseY + (rand() - 0.2) * 55;
    }

    size = 14 + rand() * 32;
    chunks.push({ cx, cy, size, z: cy }); // Sort by Y for natural depth
  }

  chunks.sort((a, b) => a.z - b.z);

  for (const c of chunks) {
    const s = c.size;
    const numPts = 5 + Math.floor(rand() * 3);
    const pts = [];
    for (let p = 0; p < numPts; p++) {
      const angle = (p / numPts) * Math.PI * 2 + (rand() - 0.5) * 0.4;
      const rad = (s * 0.5) * (0.7 + rand() * 0.6);
      pts.push({
        x: c.cx + Math.cos(angle) * rad,
        y: c.cy + Math.sin(angle) * (rad * 0.7) // perspective flattening
      });
    }

    const polyStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const centerPt = {
      x: c.cx + (rand() - 0.5) * s * 0.3,
      y: c.cy + (rand() - 0.5) * s * 0.2
    };

    // Internal facets
    let internalLines = '';
    for (let p = 0; p < pts.length; p++) {
      if (rand() > 0.3) {
        internalLines += `<line x1="${pts[p].x.toFixed(1)}" y1="${pts[p].y.toFixed(1)}" x2="${centerPt.x.toFixed(1)}" y2="${centerPt.y.toFixed(1)}" stroke="#FFFFFF" stroke-width="${(0.8 + rand() * 0.8).toFixed(1)}" stroke-opacity="${(0.5 + rand() * 0.4).toFixed(2)}"/>`;
      }
    }

    // Specular edge highlight (top facing edges)
    let glint = '';
    if (rand() > 0.4) {
      const gPt = pts[Math.floor(rand() * pts.length)];
      glint = `<circle cx="${gPt.x.toFixed(1)}" cy="${gPt.y.toFixed(1)}" r="${(1.2 + rand() * 1.8).toFixed(1)}" fill="#FFFFFF" opacity="0.95"/>`;
    }

    svg += `
      <!-- Ice Chunk -->
      <ellipse cx="${c.cx.toFixed(1)}" cy="${(c.cy + s * 0.3).toFixed(1)}" rx="${(s * 0.5).toFixed(1)}" ry="${(s * 0.18).toFixed(1)}" fill="url(#iceShadow)"/>
      <polygon points="${polyStr}" fill="url(#iceFacet1)" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.85"/>
      ${internalLines}
      ${glint}
    `;
  }

  // 3. Fine Shaved Ice Crystals (Thousands of sparkling micro-particles)
  let microGlints = '';
  for (let m = 0; m < 260; m++) {
    const mx = 320 + rand() * 960;
    const my = baseY - 20 + rand() * 85;
    const mr = 0.8 + rand() * 1.8;
    const mop = 0.5 + rand() * 0.5;
    microGlints += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${mr.toFixed(1)}" fill="#FFFFFF" opacity="${mop.toFixed(2)}"/>`;
  }
  svg += microGlints;

  svg += `
  </g>
</svg>
`;

  return Buffer.from(svg);
}

async function testIce() {
  const iceBuf = generatePhotorealisticIceBed(1600, 1200, 1030);
  await sharp(iceBuf).png().toFile('scratch/test_ice_bed.png');
  console.log('Saved scratch/test_ice_bed.png');
}

testIce();
