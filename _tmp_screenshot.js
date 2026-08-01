const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto('http://localhost:3010/boutique', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: process.argv[2] + '/boutique-mobile-viewport.png' });
  await page.screenshot({ path: process.argv[2] + '/boutique-mobile-full.png', fullPage: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: process.argv[2] + '/boutique-desktop-viewport.png' });

  console.log('Console/page errors:', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
