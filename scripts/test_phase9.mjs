import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.resolve('qa_artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPhase9Testing() {
  console.log('================================================================');
  console.log('PHASE 9 — REFERENCE-MATCHED CURSOR TRACKING & CINEMATIC INTRO QA');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    else consoleLogs.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.toString()));

  // -------------------------------------------------------------------
  // TEST SECTION 1: CINEMATIC INTRO TIMELINE CAPTURE (Sequence 1 to 7)
  // -------------------------------------------------------------------
  console.log('--- Step 1: Capturing Timeline of Cinematic Intro ---');
  
  // Clear sessionStorage to trigger intro
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  // 1. Singularity Spark (~250ms)
  await sleep(250);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'intro_01_singularity_spark.png') });
  console.log('  [Captured] intro_01_singularity_spark.png');

  // 2. Fragments Inward Drift (~650ms)
  await sleep(400);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'intro_02_fragments_orbit.png') });
  console.log('  [Captured] intro_02_fragments_orbit.png');

  // 3. Scrambled PORTFOLIO Title Assembly (~1300ms)
  await sleep(650);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'intro_03_portfolio_scramble.png') });
  console.log('  [Captured] intro_03_portfolio_scramble.png');

  // 4. Character Artwork Reveal & Upward Light Beam (~2100ms)
  await sleep(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'intro_04_character_reveal_lightbeam.png') });
  console.log('  [Captured] intro_04_character_reveal_lightbeam.png');

  // 5. Holding Keyframe Composition (~2900ms)
  await sleep(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'intro_05_hold_composition.png') });
  console.log('  [Captured] intro_05_hold_composition.png');

  // 6. Transition / Dissolve into Live Hero (~3800ms)
  await sleep(900);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'intro_06_hero_dissolved.png') });
  console.log('  [Captured] intro_06_hero_dissolved.png');

  // Verify intro dismissed
  const isIntroOverlayGone = await page.evaluate(() => {
    const el = document.querySelector('.cinematic-intro-overlay');
    return !el || window.getComputedStyle(el).opacity === '0' || el.style.opacity === '0';
  });
  console.log(`  Intro completed and dissolved into hero: ${isIntroOverlayGone ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // -------------------------------------------------------------------
  // TEST SECTION 2: INTRO CONTROLS (Skip, Escape, Replay)
  // -------------------------------------------------------------------
  console.log('\n--- Step 2: Testing Skip & Escape Controls ---');
  
  // Test Skip Intro Button
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(300);
  const skipBtn = await page.$('.intro-skip-btn');
  if (skipBtn) {
    await skipBtn.click();
    await sleep(250);
    const skipped = await page.evaluate(() => {
      const el = document.querySelector('.cinematic-intro-overlay');
      return !el || el.style.opacity === '0';
    });
    console.log(`  Skip Intro button click immediately dismisses: ${skipped ? 'YES (PASS)' : 'NO (FAIL)'}`);
  }

  // Test Replay Intro & Escape key
  const replayBtn = await page.$('button[title*="Replay"]');
  if (replayBtn) {
    await replayBtn.click();
    await sleep(400);
    const replayed = await page.$('.cinematic-intro-overlay');
    console.log(`  Replay Intro button successfully triggers overlay: ${!!replayed ? 'YES (PASS)' : 'NO (FAIL)'}`);
    
    // Press Escape
    await page.keyboard.press('Escape');
    await sleep(300);
    const escDismissed = await page.evaluate(() => {
      const el = document.querySelector('.cinematic-intro-overlay');
      return !el || el.style.opacity === '0';
    });
    console.log(`  Escape key successfully dismisses replayed intro: ${escDismissed ? 'YES (PASS)' : 'NO (FAIL)'}`);
  }

  // -------------------------------------------------------------------
  // TEST SECTION 3: REAL POINTER TRACKING & OCULAR GAZE RESPONSE
  // -------------------------------------------------------------------
  console.log('\n--- Step 3: Measuring Real Pointer Response & Character Gaze ---');

  // Test points across hero
  const testPoints = [
    { name: 'Point A (Center Neutral)', x: 720, y: 450, filename: 'tracking_point_A_center.png' },
    { name: 'Point B (Top-Left / Code Eyebrow)', x: 200, y: 150, filename: 'tracking_point_B_top_left.png' },
    { name: 'Point C (Top-Right / High Above Character)', x: 1200, y: 120, filename: 'tracking_point_C_top_right.png' },
    { name: 'Point D (Bottom-Left / CTA Buttons)', x: 250, y: 680, filename: 'tracking_point_D_bottom_left.png' },
    { name: 'Point E (Bottom-Right / Desk Workstation)', x: 1250, y: 720, filename: 'tracking_point_E_bottom_right.png' }
  ];

  const trackingMetrics = [];

  for (const pt of testPoints) {
    await page.mouse.move(pt.x, pt.y, { steps: 12 });
    // Allow damped lerp loop to interpolate smoothly
    await sleep(350);

    const measurements = await page.evaluate(() => {
      const canvas = document.querySelector('.anime-canvas');
      const backdrop = document.querySelector('.layer-0-backdrop');
      const portrait = document.querySelector('.layer-2-portrait');
      const primaryGaze = document.getElementById('ocular-tracker-primary');
      const secondaryGaze = document.getElementById('ocular-tracker-secondary');

      return {
        canvasTransform: canvas ? canvas.style.transform : 'none',
        backdropTransform: backdrop ? backdrop.style.transform : 'none',
        portraitTransform: portrait ? portrait.style.transform : 'none',
        primaryGazeTransform: primaryGaze ? primaryGaze.style.transform : 'none',
        secondaryGazeTransform: secondaryGaze ? secondaryGaze.style.transform : 'none'
      };
    });

    trackingMetrics.push({
      point: pt.name,
      pointerX: pt.x,
      pointerY: pt.y,
      measurements
    });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, pt.filename) });
    console.log(`  [Measured & Captured] ${pt.name}:`);
    console.log(`    Canvas: ${measurements.canvasTransform}`);
    console.log(`    Gaze:   ${measurements.primaryGazeTransform}`);
    console.log(`    Sigil:  ${measurements.backdropTransform}`);
  }

  // Save metrics
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'phase9_tracking_metrics.json'),
    JSON.stringify(trackingMetrics, null, 2)
  );

  // -------------------------------------------------------------------
  // TEST SECTION 4: CONSOLE ERRORS & OVERFLOW CHECK
  // -------------------------------------------------------------------
  console.log('\n--- Step 4: Stability & Hygiene Validation ---');
  console.log(`  Console errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('  Errors:', consoleErrors);
  }

  const overflowReport = await page.evaluate(() => {
    return {
      windowInnerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });
  console.log(`  Horizontal overflow: ${overflowReport.hasOverflow ? 'DETECTED (FAIL)' : 'ZERO (PASS)'}`);

  await browser.close();
  console.log('\n================================================================');
  console.log('PHASE 9 AUTOMATION COMPLETED SUCCESSFULLY');
  console.log('================================================================');
}

runPhase9Testing().catch(err => {
  console.error('Error during test execution:', err);
  process.exit(1);
});
