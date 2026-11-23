import puppeteer from 'puppeteer-core';
import path from 'path';

async function testEyeZoom() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });
  
  const fileUrl = 'file:///' + path.resolve('scripts/test_eye_overlay.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  const eyeEl = await page.$('.portrait-wrap');
  const box = await eyeEl.boundingBox();
  
  await page.screenshot({
    path: 'qa_artifacts/eye_tight_crop.png',
    clip: {
      x: box.x + 210,
      y: box.y + 175,
      width: 120,
      height: 90
    }
  });

  await browser.close();
  console.log('Saved eye tight crop');
}
testEyeZoom();
