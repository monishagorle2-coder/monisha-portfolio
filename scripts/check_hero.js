import puppeteer from 'puppeteer-core';

async function checkHero() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/');
  const skip = await page.$('.intro-skip-btn');
  if (skip) await skip.click();

  const heroBox = await page.evaluate(() => {
    const hero = document.getElementById('hero');
    const r = hero.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom };
  });
  console.log('Hero rect:', heroBox);
  await browser.close();
}
checkHero();
