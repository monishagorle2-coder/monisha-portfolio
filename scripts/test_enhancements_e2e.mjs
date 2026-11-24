import puppeteer from 'puppeteer-core';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runEnhancementsVerification() {
  console.log('====================================================');
  console.log('🧪 PORTFOLIO ENHANCEMENT & ANIMATION UPGRADE QA');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✔ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Initial Desktop Load & Intro Bypass
    // ----------------------------------------------------
    console.log('--- TEST 1: Desktop Page Load & Architecture Verification ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      sessionStorage.setItem('monisha_intro_viewed', 'true');
      window.scrollTo(0, 0);
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);

    const canvasTransform = await page.$eval('.anime-canvas', el => el.style.transform);
    assert(canvasTransform === 'none' || canvasTransform === '', 'Character canvas plate is stationary (transform: none)');

    const rightEyeBlink = await page.$('#rightEyeBlinkGroup');
    const leftEyeBlink = await page.$('#leftEyeBlinkGroup');
    assert(rightEyeBlink !== null && leftEyeBlink !== null, 'Right and Left eye blink groups exist in SVG');

    const terminalExists = await page.$('.dev-terminal-card');
    assert(terminalExists !== null, 'Developer Terminal component is rendered in About section');

    // ----------------------------------------------------
    // TEST 2: Eye Tracking & Pupil Synchronization
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Binocular Eye Gaze Synchronization ---');
    const eyeMetrics = await page.evaluate(() => {
      const canvas = document.querySelector('.anime-canvas');
      const r = canvas.getBoundingClientRect();
      return {
        eyeX: r.left + r.width * 0.614,
        eyeY: r.top + r.height * 0.358
      };
    });

    // A. Move cursor LEFT
    await page.mouse.move(eyeMetrics.eyeX - 300, eyeMetrics.eyeY, { steps: 8 });
    await sleep(450);
    let rightTransform = await page.$eval('#rightPupilGroup', el => el.style.transform);
    let leftTransform = await page.$eval('#leftPupilGroup', el => el.style.transform);

    let matchR = rightTransform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    let matchL = leftTransform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    let rX = matchR ? parseFloat(matchR[1]) : 0;
    let lX = matchL ? parseFloat(matchL[1]) : 0;

    assert(rX < -1.2 && lX < -1.0, `Both eyes gaze LEFT in lockstep (Right: ${rX.toFixed(2)}px, Left: ${lX.toFixed(2)}px)`);
    assert(Math.sign(rX) === Math.sign(lX) && Math.sign(rX) === -1, 'Both pupils share identical horizontal directional sign (negative)');

    // B. Move cursor RIGHT (staying comfortably within the 1440px viewport)
    const targetRightX = Math.min(1370, eyeMetrics.eyeX + 200);
    await page.mouse.move(targetRightX, eyeMetrics.eyeY, { steps: 8 });
    await sleep(450);
    rightTransform = await page.$eval('#rightPupilGroup', el => el.style.transform);
    leftTransform = await page.$eval('#leftPupilGroup', el => el.style.transform);
    matchR = rightTransform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    matchL = leftTransform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    rX = matchR ? parseFloat(matchR[1]) : 0;
    lX = matchL ? parseFloat(matchL[1]) : 0;

    assert(rX > 1.0 && lX > 0.8, `Both eyes gaze RIGHT in lockstep (Right: ${rX.toFixed(2)}px, Left: ${lX.toFixed(2)}px)`);
    assert(Math.sign(rX) === Math.sign(lX) && Math.sign(rX) === 1, 'Both pupils share identical directional sign (positive)');

    // ----------------------------------------------------
    // TEST 3: Natural Blinking Animation Architecture
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Natural Blinking Animation Architecture ---');
    const blinkGroupValid = await page.evaluate(() => {
      const r = document.getElementById('rightEyeBlinkGroup');
      const l = document.getElementById('leftEyeBlinkGroup');
      const rStyle = window.getComputedStyle(r);
      const lStyle = window.getComputedStyle(l);
      return {
        rOrigin: rStyle.transformOrigin,
        lOrigin: lStyle.transformOrigin,
        hasRightClass: r.classList.contains('right-eye-blink'),
        hasLeftClass: l.classList.contains('left-eye-blink')
      };
    });
    assert(blinkGroupValid.hasRightClass && blinkGroupValid.hasLeftClass, 'Right and left blink SVG groups have proper class hooks');
    assert(blinkGroupValid.rOrigin !== '' && blinkGroupValid.lOrigin !== '', 'Transform-origin configured on eyelid blink groups for natural closure');

    // ----------------------------------------------------
    // TEST 4: Scroll Stability & Chapter Progress
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Scroll Stability & Chapter Progress ---');
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
    await sleep(300);

    const scrollMetrics = await page.evaluate(() => {
      const progressBar = document.querySelector('.top-scroll-progress-bar');
      const activeDot = document.querySelector('.chapter-btn.active .chapter-name');
      return {
        scaleX: progressBar ? progressBar.style.transform : '',
        activeChapter: activeDot ? activeDot.textContent : ''
      };
    });

    assert(scrollMetrics.scaleX.includes('scaleX('), 'Top reading progress bar updates with scroll');
    assert(scrollMetrics.activeChapter === 'About' || scrollMetrics.activeChapter === 'Hero', `Chapter indicator tracked scroll position (Active: "${scrollMetrics.activeChapter}")`);

    // Scroll to Contact section at bottom
    await page.evaluate(() => {
      const contact = document.getElementById('contact');
      if (contact) contact.scrollIntoView({ behavior: 'instant' });
    });
    // Wait for the lerp damping loop to ease pupils back to resting neutral (0, 0)
    await page.waitForFunction(() => {
      const el = document.getElementById('rightPupilGroup');
      return el && el.style.transform === 'translate(0px, 0px)';
    }, { timeout: 3000 });

    const contactActive = await page.evaluate(() => {
      const activeDot = document.querySelector('.chapter-btn.active .chapter-name');
      return activeDot ? activeDot.textContent : '';
    });
    assert(contactActive === 'Contact', 'Chapter indicator marks "Contact" when scrolled to footer');

    // When hero is scrolled far off-screen, pupil transforms must be resting at (0, 0)
    const offscreenPupil = await page.$eval('#rightPupilGroup', el => el.style.transform);
    assert(offscreenPupil === 'translate(0px, 0px)', `Pupils smoothly returned to resting neutral (0px, 0px) when Hero scrolled offscreen`);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(300);

    // ----------------------------------------------------
    // TEST 5: Interactive Developer Terminal Commands
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Developer Terminal Commands ---');
    // Scroll About section into view
    await page.evaluate(() => {
      document.getElementById('about').scrollIntoView({ behavior: 'instant' });
    });
    await sleep(300);

    const runTerminalCmd = async (cmd) => {
      await page.click('.term-input');
      await page.evaluate(() => {
        const input = document.querySelector('.term-input');
        if (input) input.value = '';
      });
      await page.type('.term-input', cmd);
      await page.keyboard.press('Enter');
      await sleep(200);
    };

    // A. help command
    await runTerminalCmd('help');
    const helpOutput = await page.$eval('.dev-terminal-body', el => el.innerText);
    assert(helpOutput.includes('Available Commands:') && helpOutput.includes('whoami'), 'Command "help" lists reference manual');

    // B. whoami command
    await runTerminalCmd('whoami');
    const whoamiOutput = await page.$eval('.dev-terminal-body', el => el.innerText);
    assert(whoamiOutput.includes('Gorle Monisha') && whoamiOutput.includes('Sai Ganapathi Engineering College'), 'Command "whoami" displays genuine developer introduction');

    // C. skills command
    await runTerminalCmd('skills');
    const skillsOutput = await page.$eval('.dev-terminal-body', el => el.innerText);
    assert(skillsOutput.includes('Python') && skillsOutput.includes('React') && skillsOutput.includes('PostgreSQL'), 'Command "skills" displays verified technical competencies');

    // D. projects command
    await runTerminalCmd('projects');
    const projectsOutput = await page.$eval('.dev-terminal-body', el => el.innerText);
    assert(projectsOutput.includes('MediAssist V2') && projectsOutput.includes('Cinematic Inventory'), 'Command "projects" displays genuine projects');
    assert(!projectsOutput.includes('BuildConnect'), 'Strict Preservation Confirmed: BuildConnect is NOT in terminal output');

    // E. education command
    await runTerminalCmd('education');
    const eduOutput = await page.$eval('.dev-terminal-body', el => el.innerText);
    assert(eduOutput.includes('B.Tech in Computer Science and Engineering'), 'Command "education" displays genuine academic details');

    // F. clear command via quick chip button
    await page.evaluate(() => {
      const chips = document.querySelectorAll('button.term-chip-btn');
      const clearBtn = Array.from(chips).find(c => c.textContent.trim() === 'clear');
      if (clearBtn) clearBtn.click();
    });
    await sleep(200);
    const clearedLogs = await page.$$eval('.term-log-entry', els => els.length);
    assert(clearedLogs === 0, 'Command chip "clear" successfully clears terminal output');

    // G. Invalid command handling
    await runTerminalCmd('unknown_cmd');
    const errorOutput = await page.$eval('.dev-terminal-body', el => el.innerText);
    assert(errorOutput.includes('command not found: unknown_cmd'), 'Invalid command displays safe error with help guidance');

    // ----------------------------------------------------
    // TEST 6: Dark and Light Theme Verification
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Dark & Light Theme Verification ---');
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(initialTheme === 'dark', 'Initial theme is dark');

    // Click theme toggle
    await page.click('.nav-theme-btn');
    await sleep(250);
    const lightTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(lightTheme === 'light', 'Theme toggled to light mode successfully');

    // Verify terminal background in light mode
    const termLightBg = await page.$eval('.dev-terminal-card', el => window.getComputedStyle(el).backgroundColor);
    assert(termLightBg.includes('255'), 'Developer terminal adapts cleanly to light mode background');

    // Toggle back to dark
    await page.click('.nav-theme-btn');
    await sleep(250);
    const revertedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(revertedTheme === 'dark', 'Theme reverted back to dark mode successfully');

    // ----------------------------------------------------
    // TEST 7: Mobile Viewport & Responsiveness
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Mobile Viewport & Layout Verification ---');
    await page.setViewport({ width: 375, height: 812 });
    await sleep(300);

    const mobileGrid = await page.$eval('.about-grid', el => window.getComputedStyle(el).gridTemplateColumns);
    assert(mobileGrid === '343px' || !mobileGrid.includes(' '), 'About section stacks in single column on mobile');

    const termMobileWidth = await page.$eval('.dev-terminal-card', el => el.offsetWidth);
    assert(termMobileWidth <= 345, `Developer terminal fits mobile width without overflow (${termMobileWidth}px <= 345px)`);

    // ----------------------------------------------------
    // TEST 8: Reduced-Motion Behavior Verification
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Reduced-Motion Accessibility ---');
    // Click motion toggle in nav
    await page.click('.nav-motion-btn');
    await sleep(250);

    const isReduced = await page.evaluate(() => document.body.classList.contains('reduced-motion'));
    assert(isReduced, 'Body reflects reduced-motion state');

    // Scroll to top and verify pupil transforms are locked at (0, 0)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(200);
    await page.mouse.move(100, 100);
    await sleep(200);
    const reducedPupil = await page.$eval('#rightPupilGroup', el => el.style.transform);
    assert(reducedPupil === 'translate(0px, 0px)', 'Eye tracking is strictly disabled under reduced motion');

    // ----------------------------------------------------
    // TEST 9: Console Error Audit
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Console Error Audit ---');
    assert(consoleErrors.length === 0, `0 console errors detected (Found: ${consoleErrors.length})`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(e => console.error('  [Console Error]:', e));
    }

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  process.exitCode = failed > 0 ? 1 : 0;
}

runEnhancementsVerification();
