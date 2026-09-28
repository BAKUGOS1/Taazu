const sharp = require('sharp');
const fs = require('fs');

async function prepareAssets() {
  console.log('Extracting exact emblem from bottle...');
  // Extract emblem with margin
  const emblemRaw = await sharp('brand-kit/creatives/09-hero-bottle-a1.jpg')
    .extract({ left: 405, top: 435, width: 88, height: 110 })
    .png()
    .toBuffer();

  const maskSvg = `
    <svg width="88" height="110" viewBox="0 0 88 110" xmlns="http://www.w3.org/2000/svg">
      <path d="M 44 18 C 41 31, 10 65, 10 82 A 34 34 0 0 0 78 82 C 78 65, 47 31, 44 18 Z" fill="#FFFFFF"/>
    </svg>
  `;

  const maskBuf = await sharp(Buffer.from(maskSvg)).png().toBuffer();

  await sharp(emblemRaw)
    .composite([{ input: maskBuf, blend: 'dest-in' }])
    .png()
    .toFile('scratch/bottle_emblem_clean.png');

  console.log('Saved scratch/bottle_emblem_clean.png');
}

prepareAssets().catch(console.error);
