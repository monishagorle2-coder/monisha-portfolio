import puppeteer from 'puppeteer-core';

async function diagnose() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();

  const VIEWPORTS = [
    { name: '320_narrow', width: 320, height: 640 },
    { name: '390_mobile', width: 390, height: 844 },
    { name: '768_tablet', width: 768, height: 1024 },
    { name: '1024_laptop', width: 1024, height: 800 },
    { name: '1440_desktop', width: 1440, height: 900 }
  ];

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.width < 992 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // Dismiss intro if present
    const skipBtn = await page.$('.intro-skip-btn');
    if (skipBtn) {
      await skipBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }

    const data = await page.evaluate(() => {
      const windowInnerWidth = window.innerWidth;
      const docClientWidth = document.documentElement.clientWidth;
      const docScrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;

      // Find any element whose bounding rect right exceeds docClientWidth
      const offenders = [];
      const all = Array.from(document.querySelectorAll('*'));
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.right > docClientWidth + 0.5) {
          const style = window.getComputedStyle(el);
          offenders.push({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className: typeof el.className === 'string' ? el.className : el.className?.baseVal || '',
            right: Math.round(r.right),
            left: Math.round(r.left),
            width: Math.round(r.width),
            position: style.position,
            overflow: style.overflow
          });
        }
      }

      return {
        windowInnerWidth,
        docClientWidth,
        docScrollWidth,
        bodyScrollWidth,
        hasHorizontalOverflow: docScrollWidth > docClientWidth || bodyScrollWidth > docClientWidth,
        offenderCount: offenders.length,
        offenders
      };
    });

    console.log(`\n=== Viewport ${vp.name} (${vp.width}x${vp.height}) ===`);
    console.log(`window.innerWidth:              ${data.windowInnerWidth}px`);
    console.log(`document.documentElement.clientWidth: ${data.docClientWidth}px`);
    console.log(`document.documentElement.scrollWidth: ${data.docScrollWidth}px`);
    console.log(`document.body.scrollWidth:            ${data.bodyScrollWidth}px`);
    console.log(`Has horizontal overflow:        ${data.hasHorizontalOverflow}`);
    if (data.offenderCount > 0) {
      console.log(`Offenders extending beyond clientWidth (${data.offenderCount}):`);
      data.offenders.forEach((o, i) => {
        console.log(`  [${i+1}] <${o.tag} id="${o.id}" class="${o.className}"> right=${o.right}px width=${o.width}px pos=${o.position}`);
      });
    } else {
      console.log('Zero overflowing elements found.');
    }
  }

  await browser.close();
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
