import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateAssets() {
  const dirs = [
    path.resolve(__dirname, '../apps/web/public/sponsors/ibrand'),
    path.resolve(__dirname, '../apps/web/public/sponsors/ibrand-tunisia'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // High quality SVG with clean vector typography for iBrand Tunisia
  const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 160" width="700" height="160">
    <text x="25" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="110" fill="#E91E63">i</text>
    <text x="65" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="110" fill="#5B2EB7" letter-spacing="-1">BRAND</text>
    <text x="375" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="400" font-size="105" fill="#222222" letter-spacing="4">TUNISIA</text>
  </svg>`;

  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 160" width="700" height="160">
    <text x="25" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="110" fill="#FF2E93">i</text>
    <text x="65" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="110" fill="#7C4DFF" letter-spacing="-1">BRAND</text>
    <text x="375" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="400" font-size="105" fill="#FFFFFF" letter-spacing="4">TUNISIA</text>
  </svg>`;

  for (const dir of dirs) {
    fs.writeFileSync(path.join(dir, 'logo.svg'), lightSvg);
    fs.writeFileSync(path.join(dir, 'logo-dark.svg'), darkSvg);

    // Generate raster PNG & WEBP
    const lightBuffer = Buffer.from(lightSvg);
    const darkBuffer = Buffer.from(darkSvg);

    await sharp(lightBuffer)
      .png()
      .toFile(path.join(dir, 'logo.png'));

    await sharp(lightBuffer)
      .png()
      .toFile(path.join(dir, 'logo-original.png'));

    await sharp(lightBuffer)
      .webp({ quality: 95 })
      .toFile(path.join(dir, 'logo.webp'));

    await sharp(lightBuffer)
      .resize(300)
      .webp({ quality: 90 })
      .toFile(path.join(dir, 'thumbnail.webp'));

    await sharp(darkBuffer)
      .png()
      .toFile(path.join(dir, 'logo-dark.png'));

    await sharp(darkBuffer)
      .webp({ quality: 95 })
      .toFile(path.join(dir, 'logo-dark.webp'));

    console.log(`Generated all assets for ${dir}`);
  }

  // Also generate azuro assets
  const azuroDir = path.resolve(__dirname, '../apps/web/public/sponsors/azuro');
  if (!fs.existsSync(azuroDir)) fs.mkdirSync(azuroDir, { recursive: true });

  const azuroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 160" width="600" height="160">
    <text x="50%" y="90" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="95" fill="#0D63FF" letter-spacing="6">AZURO</text>
    <text x="50%" y="135" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="30" fill="#002244" letter-spacing="12">BRAND</text>
  </svg>`;

  fs.writeFileSync(path.join(azuroDir, 'logo.svg'), azuroSvg);
  const azuroBuf = Buffer.from(azuroSvg);
  await sharp(azuroBuf).png().toFile(path.join(azuroDir, 'logo.png'));
  await sharp(azuroBuf).webp({ quality: 95 }).toFile(path.join(azuroDir, 'logo.webp'));
  await sharp(azuroBuf).webp({ quality: 90 }).toFile(path.join(azuroDir, 'logo-dark.webp'));
  await sharp(azuroBuf).resize(300).webp({ quality: 90 }).toFile(path.join(azuroDir, 'thumbnail.webp'));
  console.log(`Generated all assets for azuro`);
}

generateAssets().catch(console.error);
