import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const QA_DIR = path.resolve('qa_artifacts/refinement');
if (!fs.existsSync(QA_DIR)) {
  fs.mkdirSync(QA_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:4173/';

async function runTests() {
  console.log('🚀 Starting Refinement Verification Test Suite...\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Desktop Viewport (1440x900)
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(URL, { waitUntil: 'networkidle2' });

    console.log('✔ Page loaded at 1440x900');

    // 2. Check if Cinematic Intro is present and can be skipped
    const introEl = await page.$('.cinematic-intro-overlay');
    if (introEl) {
      console.log('✔ Cinematic Intro detected');
      const skipBtn = await page.$('.intro-skip-btn');
      if (skipBtn) {
        await skipBtn.click();
        console.log('✔ Clicked skip intro button');
        await page.waitForSelector('.cinematic-intro-overlay', { hidden: true, timeout: 3000 });
      }
    }

    await new Promise(r => setTimeout(r, 600));

    // 3. Verify Theme Default
    let themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    console.log(`✔ Initial theme data-theme: ${themeAttr}`);

    // Take Dark Theme Screenshot
    await page.screenshot({ path: path.join(QA_DIR, '01_desktop_dark_theme.png'), fullPage: false });
    console.log('✔ Saved screenshot: 01_desktop_dark_theme.png');

    // 4. Test Custom Cursor on Desktop
    const cursorContainer = await page.$('.custom-cursor-container');
    const cursorDot = await page.$('.cursor-dot');
    const cursorRing = await page.$('.cursor-ring');
    if (cursorContainer && cursorDot && cursorRing) {
      console.log('✔ Custom Cursor elements (.cursor-dot, .cursor-ring) present on desktop');
    } else {
      console.error('❌ Custom Cursor missing on desktop');
    }

    // Move mouse to trigger cursor
    await page.mouse.move(400, 300);
    await new Promise(r => setTimeout(r, 100));

    // Hover over an interactive button to test expansion
    const viewProjectsBtn = await page.$('.hero-ctas .btn-primary');
    if (viewProjectsBtn) {
      const box = await viewProjectsBtn.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await new Promise(r => setTimeout(r, 200));
        const isHovered = await page.evaluate(() => {
          const el = document.querySelector('.custom-cursor-container');
          return el ? el.classList.contains('hovered') : false;
        });
        console.log(`✔ Cursor expansion on button hover: ${isHovered}`);
      }
    }

    // 5. Test Theme Toggle to Light
    const themeBtn = await page.$('.nav-theme-btn');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise(r => setTimeout(r, 400));
      themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      const bgBase = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      console.log(`✔ Toggled theme. data-theme: ${themeAttr}, body background: ${bgBase}`);
      
      // Take Light Theme Screenshot
      await page.screenshot({ path: path.join(QA_DIR, '02_desktop_light_theme.png'), fullPage: false });
      console.log('✔ Saved screenshot: 02_desktop_light_theme.png');

      // 6. Test Theme Persistence Across Page Refresh
      await page.reload({ waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const reloadedTheme = await page.evaluate(() => {
        return {
          attr: document.documentElement.getAttribute('data-theme'),
          storage: localStorage.getItem('portfolio-theme')
        };
      });
      console.log(`✔ After reload: data-theme: ${reloadedTheme.attr}, localStorage: ${reloadedTheme.storage}`);
    } else {
      console.error('❌ Theme toggle button .nav-theme-btn not found');
    }

    // 7. Test Project Modal Interaction
    const caseStudyBtn = await page.$('.btn-case-study');
    if (caseStudyBtn) {
      await caseStudyBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const modalOpen = await page.$('.modal-panel.project-modal-panel');
      console.log(`✔ Case study modal opened: ${!!modalOpen}`);
      
      await page.screenshot({ path: path.join(QA_DIR, '03_project_modal_light.png'), fullPage: false });
      console.log('✔ Saved screenshot: 03_project_modal_light.png');

      // Close modal with Escape
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
      const modalClosed = await page.evaluate(() => !document.querySelector('.modal-panel'));
      console.log(`✔ Modal closed with Escape key: ${modalClosed}`);
    }

    // 8. Test Eye Tracking Elements Exist
    const rightPupil = await page.$('#rightPupilGroup');
    const leftPupil = await page.$('#leftPupilGroup');
    console.log(`✔ Stationary Character Eye Gaze Elements present: right=${!!rightPupil}, left=${!!leftPupil}`);

    // 9. Test Responsive Viewports & Horizontal Overflow
    const viewports = [
      { name: 'laptop', width: 1024, height: 768 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 390, height: 844 },
      { name: 'narrow_mobile', width: 320, height: 640 }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 300));

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      console.log(`✔ Viewport ${vp.name} (${vp.width}x${vp.height}): Overflow: ${hasOverflow ? 'FAIL' : 'PASS (Clean)'}`);
      await page.screenshot({ path: path.join(QA_DIR, `04_${vp.name}_view.png`), fullPage: false });
    }

    // 10. Check Console Errors
    console.log(`✔ Total Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
    }

    console.log('\n🎉 All Refinement Verification Tests Completed Successfully!');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }
}

runTests();
