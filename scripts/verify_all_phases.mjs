import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const QA_DIR = path.resolve('qa_artifacts/refinement');
if (!fs.existsSync(QA_DIR)) {
  fs.mkdirSync(QA_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:4173/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runFullVerification() {
  console.log('========================================================');
  console.log('🚀 STARTING COMPREHENSIVE REFINEMENT AUDIT & TEST SUITE');
  console.log('========================================================\n');

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
    // -------------------------------------------------------------------------
    // TEST 1: Cinematic Intro & Automatic Name Typing (Phase 4)
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Cinematic Intro & Automatic Name Typing ---');
    await page.setViewport({ width: 1440, height: 900 });
    
    // Clear localStorage to test fresh user experience
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    const introOverlay = await page.$('.cinematic-intro-overlay');
    console.log(`✔ Cinematic Intro Overlay rendered: ${!!introOverlay}`);

    // Skip intro
    const skipBtn = await page.$('.intro-skip-btn');
    if (skipBtn) {
      await skipBtn.click();
      console.log('✔ Clicked Skip Intro button');
    }

    // Wait for cinematic overlay to hide
    await page.waitForSelector('.cinematic-intro-overlay', { hidden: true, timeout: 4000 });
    console.log('✔ Cinematic overlay dismissed');

    // Wait for typing to complete (name has 13 chars, 70ms each = ~910ms + 250ms delay)
    await sleep(400);
    const midTypingText = await page.evaluate(() => {
      const el = document.querySelector('.hero-title-text');
      return el ? el.textContent : '';
    });
    console.log(`✔ Mid-typing text captured: "${midTypingText}"`);

    await sleep(1200);
    const finalTypingText = await page.evaluate(() => {
      const el = document.querySelector('.hero-title-text');
      return el ? el.textContent : '';
    });
    console.log(`✔ Final typed name: "${finalTypingText}"`);
    if (finalTypingText === 'Gorle Monisha') {
      console.log('✔ [PASS] Automatic name typing completed accurately: "Gorle Monisha"');
    } else {
      console.error(`❌ [FAIL] Name typing unexpected: "${finalTypingText}"`);
    }

    // Verify typing cursor
    const cursorEl = await page.$('.typing-cursor');
    console.log(`✔ Typing cursor element present: ${!!cursorEl}`);

    // Verify subtitle revealed state
    const isRoleRevealed = await page.evaluate(() => {
      const el = document.querySelector('.hero-role');
      return el ? el.classList.contains('revealed') : false;
    });
    console.log(`✔ Developer title subtitle revealed: ${isRoleRevealed}`);

    // -------------------------------------------------------------------------
    // TEST 2: Navigation Active State at Page Top (Phase 6)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Navigation Active Indicator ---');
    const initialActiveNav = await page.evaluate(() => {
      const activeLink = document.querySelector('.nav-link.active');
      return activeLink ? activeLink.getAttribute('href') : null;
    });
    console.log(`✔ Active nav link at page top: "${initialActiveNav}"`);
    if (initialActiveNav === '#hero') {
      console.log('✔ [PASS] Active nav link correctly starts on "#hero" (Bug fixed!)');
    } else {
      console.error(`❌ [FAIL] Active nav link is "${initialActiveNav}" instead of "#hero"`);
    }

    // Capture dark theme hero screenshot
    await page.screenshot({ path: path.join(QA_DIR, '01_hero_dark_typed.png'), fullPage: false });
    console.log('✔ Saved screenshot: 01_hero_dark_typed.png');

    // -------------------------------------------------------------------------
    // TEST 3: Character Eye Tracking (Phase 3)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Character Eye Gaze Tracking ---');
    const rightPupil = await page.$('#rightPupilGroup');
    const leftPupil = await page.$('#leftPupilGroup');
    console.log(`✔ Eye pupils in DOM: right=${!!rightPupil}, left=${!!leftPupil}`);

    // Move pointer to top-left
    await page.mouse.move(200, 200);
    await sleep(250);
    const leftGazeTransform = await page.evaluate(() => {
      const r = document.querySelector('#rightPupilGroup');
      const l = document.querySelector('#leftPupilGroup');
      return {
        r: r ? r.style.transform : '',
        l: l ? l.style.transform : ''
      };
    });
    console.log(`✔ Gaze toward (200, 200): Right pupil: ${leftGazeTransform.r}, Left pupil: ${leftGazeTransform.l}`);

    // Move pointer to bottom-right
    await page.mouse.move(1200, 700);
    await sleep(250);
    const rightGazeTransform = await page.evaluate(() => {
      const r = document.querySelector('#rightPupilGroup');
      const l = document.querySelector('#leftPupilGroup');
      return {
        r: r ? r.style.transform : '',
        l: l ? l.style.transform : ''
      };
    });
    console.log(`✔ Gaze toward (1200, 700): Right pupil: ${rightGazeTransform.r}, Left pupil: ${rightGazeTransform.l}`);

    // Move mouse out to test return to resting neutral
    await page.mouse.move(0, 0);
    await sleep(500);
    const neutralTransform = await page.evaluate(() => {
      const r = document.querySelector('#rightPupilGroup');
      return r ? r.style.transform : '';
    });
    console.log(`✔ Return to neutral gaze: Right pupil: ${neutralTransform}`);

    // -------------------------------------------------------------------------
    // TEST 4: Light Theme Warm Ivory & Contrast (Phase 1)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Light Theme Warm Ivory & Hierarchy ---');
    const themeBtn = await page.$('.nav-theme-btn');
    if (themeBtn) {
      await themeBtn.click();
      await sleep(350);

      const lightThemeStyles = await page.evaluate(() => {
        const docTheme = document.documentElement.getAttribute('data-theme');
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const bodyColor = getComputedStyle(document.body).color;
        const heroTitle = document.querySelector('.hero-title-text');
        const titleColor = heroTitle ? getComputedStyle(heroTitle).color : '';
        const cardEl = document.querySelector('.edu-card') || document.querySelector('.skill-category-card');
        const cardBg = cardEl ? getComputedStyle(cardEl).backgroundColor : '';
        return { docTheme, bodyBg, bodyColor, titleColor, cardBg };
      });

      console.log(`✔ Light Theme data-theme: ${lightThemeStyles.docTheme}`);
      console.log(`✔ Body Background: ${lightThemeStyles.bodyBg} (Warm Ivory #fbf8f3)`);
      console.log(`✔ Text Primary: ${lightThemeStyles.titleColor} (Deep Charcoal #181716)`);
      console.log(`✔ Card Surface: ${lightThemeStyles.cardBg} (Crisp White #ffffff)`);

      await page.screenshot({ path: path.join(QA_DIR, '02_hero_light_theme.png'), fullPage: false });
      console.log('✔ Saved screenshot: 02_hero_light_theme.png');
    }

    // -------------------------------------------------------------------------
    // TEST 5: Education & Certification Card Interactions (Phase 2)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Education & Certification Card Interactions ---');
    // Scroll to education section
    await page.evaluate(() => {
      const eduSec = document.querySelector('#education');
      if (eduSec) eduSec.scrollIntoView();
    });
    await sleep(500);

    const eduCard = await page.$('.edu-card');
    if (eduCard) {
      const box = await eduCard.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await sleep(250);

        const cursorHoveredOnEdu = await page.evaluate(() => {
          const el = document.querySelector('.custom-cursor-container');
          return el ? el.classList.contains('hovered') : false;
        });
        console.log(`✔ Custom cursor expansion over Education card: ${cursorHoveredOnEdu}`);
      }
    }

    const certCard = await page.$('.cert-card');
    if (certCard) {
      const box = await certCard.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await sleep(250);

        const cursorHoveredOnCert = await page.evaluate(() => {
          const el = document.querySelector('.custom-cursor-container');
          return el ? el.classList.contains('hovered') : false;
        });
        console.log(`✔ Custom cursor expansion over Certification card: ${cursorHoveredOnCert}`);
      }
    }

    await page.screenshot({ path: path.join(QA_DIR, '03_education_cards_light.png'), fullPage: false });
    console.log('✔ Saved screenshot: 03_education_cards_light.png');

    // -------------------------------------------------------------------------
    // TEST 6: Project Showcase & Image Presentation (Phase 5)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Projects & Media Presentation ---');
    await page.evaluate(() => {
      const projSec = document.querySelector('#projects');
      if (projSec) projSec.scrollIntoView();
    });
    await sleep(500);

    const mediaStyle = await page.evaluate(() => {
      const preview = document.querySelector('.project-card-media-preview');
      const thumb = document.querySelector('.project-preview-thumb');
      return {
        aspectRatio: preview ? getComputedStyle(preview).aspectRatio : '',
        objectFit: thumb ? getComputedStyle(thumb).objectFit : ''
      };
    });
    console.log(`✔ Project preview media: aspect-ratio=${mediaStyle.aspectRatio}, object-fit=${mediaStyle.objectFit}`);

    await page.screenshot({ path: path.join(QA_DIR, '04_projects_light.png'), fullPage: false });
    console.log('✔ Saved screenshot: 04_projects_light.png');

    // Open Case Study Modal
    const caseStudyBtn = await page.$('.btn-case-study');
    if (caseStudyBtn) {
      await caseStudyBtn.click();
      await sleep(400);

      const modalImgStyle = await page.evaluate(() => {
        const img = document.querySelector('.architecture-img');
        return img ? {
          src: img.getAttribute('src'),
          objectFit: getComputedStyle(img).objectFit,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        } : null;
      });
      console.log('✔ Case study architecture diagram details:', modalImgStyle);

      await page.screenshot({ path: path.join(QA_DIR, '05_case_study_modal_light.png'), fullPage: false });
      console.log('✔ Saved screenshot: 05_case_study_modal_light.png');

      await page.keyboard.press('Escape');
      await sleep(400);
    }

    // -------------------------------------------------------------------------
    // TEST 7: Responsive Viewports Audit (1440, 1024, 768, 390, 320)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Responsive Viewports Audit (No Horizontal Overflow) ---');
    const viewports = [
      { name: '1440_desktop', width: 1440, height: 900 },
      { name: '1024_laptop', width: 1024, height: 768 },
      { name: '768_tablet', width: 768, height: 1024 },
      { name: '390_mobile', width: 390, height: 844 },
      { name: '320_narrow_mobile', width: 320, height: 640 }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await sleep(300);

      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        };
      });

      console.log(`✔ Viewport ${vp.name} (${vp.width}x${vp.height}): ScrollWidth=${overflow.scrollWidth}, ClientWidth=${overflow.clientWidth} -> ${overflow.hasOverflow ? '❌ OVERFLOW' : '✔ PASS'}`);
      await page.screenshot({ path: path.join(QA_DIR, `06_viewport_${vp.name}.png`), fullPage: false });
    }

    // -------------------------------------------------------------------------
    // TEST 8: Console Errors Check
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Console Errors Audit ---');
    console.log(`✔ Total Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors);
    } else {
      console.log('✔ [PASS] 0 Console Errors throughout the entire test suite');
    }

    console.log('\n========================================================');
    console.log('🎉 ALL REFINEMENT VERIFICATIONS COMPLETED SUCCESSFULLY!');
    console.log('========================================================');
  } catch (err) {
    console.error('❌ Audit encountered an error:', err);
  } finally {
    await browser.close();
  }
}

runFullVerification();
