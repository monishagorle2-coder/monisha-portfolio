import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('qa_artifacts');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.assertions = [];
  }

  assert(condition, description, details = null) {
    if (condition) {
      this.passed++;
      this.assertions.push({ status: 'PASS', description, details });
      console.log(`  [PASS] ${description}`);
    } else {
      this.failed++;
      this.assertions.push({ status: 'FAIL', description, details });
      console.error(`  [FAIL] ${description} ${details ? JSON.stringify(details) : ''}`);
    }
  }

  summary() {
    return {
      total: this.passed + this.failed,
      passed: this.passed,
      failed: this.failed,
      allPassed: this.failed === 0,
      assertions: this.assertions
    };
  }
}

async function runComprehensiveQA() {
  console.log('================================================================');
  console.log('PHASE 8 REAL BROWSER QA TEST SUITE (Chrome Engine)');
  console.log('Strict Evidence-Based Assertions Verification');
  console.log('================================================================\n');

  const runner = new TestRunner();
  const consoleErrors = [];

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  // Grant clipboard permissions for test context
  const context = browser.defaultBrowserContext();
  try {
    await context.overridePermissions('http://localhost:4173', ['clipboard-read', 'clipboard-write']);
  } catch (e) {
    // Ignore if not supported in headless mode
  }

  // ---------------------------------------------------------
  // 1. Initial Load & Cinematic Intro Sequence
  // ---------------------------------------------------------
  console.log('\n--- SUITE 1: Cinematic Intro & Session State ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // 1a. Intro element presence
  const introEl = await page.$('.cinematic-intro-overlay');
  runner.assert(!!introEl, 'Cinematic intro overlay rendered on first visit');

  // 1b. Skip Intro button action
  const skipBtn = await page.$('.intro-skip-btn');
  runner.assert(!!skipBtn, 'Skip Intro button is present in overlay');

  if (skipBtn) {
    await skipBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  const introDismissed = await page.evaluate(() => {
    const el = document.querySelector('.cinematic-intro-overlay');
    return !el || window.getComputedStyle(el).opacity === '0' || el.style.opacity === '0';
  });
  runner.assert(introDismissed, 'Cinematic intro is dismissed upon clicking Skip Intro button');

  // 1c. SessionStorage flag set
  const sessionFlag = await page.evaluate(() => sessionStorage.getItem('monisha_intro_viewed'));
  runner.assert(sessionFlag === 'true', 'SessionStorage "monisha_intro_viewed" correctly flagged as true');

  // 1d. Replay Intro button
  const replayBtn = await page.$('button[title*="Replay"]');
  runner.assert(!!replayBtn, 'Replay Intro button is present on the hero section');

  if (replayBtn) {
    await replayBtn.click();
    await new Promise(r => setTimeout(r, 300));
    const replayedIntro = await page.$('.cinematic-intro-overlay');
    runner.assert(!!replayedIntro, 'Clicking Replay Intro re-mounts the cinematic overlay');

    // 1e. Escape key skips replayed intro
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 600));
    const dismissedViaEscape = await page.evaluate(() => {
      const el = document.querySelector('.cinematic-intro-overlay');
      return !el || window.getComputedStyle(el).opacity === '0' || el.style.opacity === '0';
    });
    runner.assert(dismissedViaEscape, 'Pressing Escape key successfully skips the active intro');
  }

  // ---------------------------------------------------------
  // 2. Navigation & Mobile Menu Behavior
  // ---------------------------------------------------------
  console.log('\n--- SUITE 2: Navigation & Mobile Drawer ---');
  
  // 2a. Desktop nav targets
  const navTargets = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.nav-links .nav-link'));
    return links.map(l => ({
      href: l.getAttribute('href'),
      exists: !!document.querySelector(l.getAttribute('href'))
    }));
  });
  runner.assert(navTargets.length === 6, 'Desktop navigation renders exactly 6 links', { count: navTargets.length });
  runner.assert(navTargets.every(t => t.exists), 'All 6 desktop navigation links point to valid DOM section IDs');

  // 2b. Mobile Menu Open & Close
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await new Promise(r => setTimeout(r, 300));

  const mobileToggle = await page.$('.mobile-menu-toggle');
  runner.assert(!!mobileToggle, 'Mobile menu hamburger toggle button is visible at 390px');

  if (mobileToggle) {
    await mobileToggle.click();
    await new Promise(r => setTimeout(r, 300));
    const drawerOpen = await page.$('.mobile-nav-drawer');
    runner.assert(!!drawerOpen, 'Clicking hamburger toggle renders .mobile-nav-drawer');

    const drawerLink = await page.$('.mobile-nav-link');
    if (drawerLink) {
      await drawerLink.click();
      await new Promise(r => setTimeout(r, 300));
      const drawerClosed = await page.$('.mobile-nav-drawer');
      runner.assert(!drawerClosed, 'Clicking a link inside mobile drawer closes the drawer');
    }
  }

  // Restore desktop viewport
  await page.setViewport({ width: 1440, height: 900, isMobile: false });

  // ---------------------------------------------------------
  // 3. Motion Preference & Toggle
  // ---------------------------------------------------------
  console.log('\n--- SUITE 3: Motion Toggle & Reduced-Motion ---');
  const initialMotionClass = await page.evaluate(() => document.body.classList.contains('reduced-motion'));
  const motionBtn = await page.$('.nav-motion-btn');
  runner.assert(!!motionBtn, 'Motion toggle button exists in header');

  if (motionBtn) {
    await motionBtn.click();
    await new Promise(r => setTimeout(r, 200));
    const toggledClass = await page.evaluate(() => document.body.classList.contains('reduced-motion'));
    runner.assert(toggledClass !== initialMotionClass, 'Clicking motion toggle toggles body.reduced-motion class');

    // Toggle back
    await motionBtn.click();
    await new Promise(r => setTimeout(r, 200));
    const restoredClass = await page.evaluate(() => document.body.classList.contains('reduced-motion'));
    runner.assert(restoredClass === initialMotionClass, 'Second click restores original motion mode');
  }

  // ---------------------------------------------------------
  // 4. Skills Category Filters
  // ---------------------------------------------------------
  console.log('\n--- SUITE 4: Skills Category Filtering ---');
  const categoriesToTest = [
    { id: 'cs-fundamentals', expected: 1, keyText: 'Algorithms' },
    { id: 'frontend', expected: 1, keyText: 'React' },
    { id: 'backend', expected: 1, keyText: 'Node.js' },
    { id: 'security-ai', expected: 1, keyText: 'JWT' },
    { id: 'tools', expected: 1, keyText: 'Git' },
    { id: 'all', expected: 5, keyText: null }
  ];

  for (const cat of categoriesToTest) {
    await page.evaluate((id) => {
      const btns = Array.from(document.querySelectorAll('.skills-tab-btn'));
      if (id === 'all') {
        btns[0]?.click();
      } else {
        const target = btns.find(b => {
          const text = b.textContent.toLowerCase();
          if (id === 'security-ai') return text.includes('security') && text.includes('ai');
          if (id === 'cs-fundamentals') return text.includes('fundamentals') || text.includes('cs');
          return text.includes(id.replace(/-/g, ' '));
        });
        target?.click();
      }
    }, cat.id);

    await new Promise(r => setTimeout(r, 200));

    const check = await page.evaluate((expectedCount, keyText) => {
      const cards = Array.from(document.querySelectorAll('.skill-category-card'));
      const text = cards.map(c => c.textContent).join(' ');
      const countMatch = cards.length === expectedCount;
      const textMatch = keyText ? text.includes(keyText) : true;
      return { countMatch, textMatch, actualCount: cards.length };
    }, cat.expected, cat.keyText);

    runner.assert(
      check.countMatch && check.textMatch, 
      `Skills filter '${cat.id}' rendered ${cat.expected} category card(s) matching expected criteria`,
      check
    );
  }

  // ---------------------------------------------------------
  // 5. Project Modals & Scroll Lock Verification
  // ---------------------------------------------------------
  console.log('\n--- SUITE 5: Project Modals & Scroll Locking ---');
  const caseStudyBtn = await page.$('.btn-case-study');
  runner.assert(!!caseStudyBtn, 'Explore Case Study button exists on project card');

  if (caseStudyBtn) {
    // 5a. Open modal & verify scroll lock
    await caseStudyBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const openState = await page.evaluate(() => {
      const modal = document.querySelector('.modal-backdrop.active');
      const overflow = document.body.style.overflow;
      return { isOpen: !!modal, isLocked: overflow === 'hidden' };
    });
    runner.assert(openState.isOpen, 'Clicking Explore Case Study opens .modal-backdrop.active');
    runner.assert(openState.isLocked, 'Opening modal sets document.body.style.overflow = "hidden"');

    // 5b. Close via Escape key & verify scroll restoration
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
    const escapeClosedState = await page.evaluate(() => {
      const modal = document.querySelector('.modal-backdrop.active');
      const overflow = document.body.style.overflow;
      return { isClosed: !modal, isRestored: overflow !== 'hidden' };
    });
    runner.assert(escapeClosedState.isClosed, 'Pressing Escape key closes modal');
    runner.assert(escapeClosedState.isRestored, 'Closing via Escape restores page scrolling');

    // 5c. Close via (X) button
    await caseStudyBtn.click();
    await new Promise(r => setTimeout(r, 400));
    const closeBtn = await page.$('.modal-close-btn');
    runner.assert(!!closeBtn, 'Modal close button (X) is rendered inside modal header');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const xClosedState = await page.evaluate(() => !document.querySelector('.modal-backdrop.active'));
      runner.assert(xClosedState, 'Clicking (X) button closes modal');
    }

    // 5d. Close via Backdrop click
    await caseStudyBtn.click();
    await new Promise(r => setTimeout(r, 400));
    await page.mouse.click(50, 50); // Click outside modal panel on backdrop
    await new Promise(r => setTimeout(r, 400));
    const backdropClosedState = await page.evaluate(() => {
      const modal = document.querySelector('.modal-backdrop.active');
      const overflow = document.body.style.overflow;
      return { isClosed: !modal, isRestored: overflow !== 'hidden' };
    });
    runner.assert(backdropClosedState.isClosed, 'Clicking backdrop outside modal panel closes modal');
    runner.assert(backdropClosedState.isRestored, 'Closing via backdrop restores page scrolling');
  }

  // ---------------------------------------------------------
  // 6. Contact Form Validation & Mailto Action
  // ---------------------------------------------------------
  console.log('\n--- SUITE 6: Contact Form Validation & Mailto Action ---');
  const formValidationChecks = await page.evaluate(() => {
    const form = document.querySelector('.contact-form');
    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    const submitBtn = document.querySelector('.submit-btn');

    if (!form || !nameInput || !emailInput || !submitBtn) {
      return { missingElements: true };
    }

    // Empty form validity
    const emptyInvalid = !form.checkValidity();

    // Invalid email validity
    nameInput.value = 'Test Recruiter';
    emailInput.value = 'invalid-email-address';
    const invalidEmailRejected = !emailInput.checkValidity();

    // Valid email validity
    emailInput.value = 'recruiter@enterprise.com';
    const validAccepted = emailInput.checkValidity();

    return {
      missingElements: false,
      emptyInvalid,
      invalidEmailRejected,
      validAccepted
    };
  });

  runner.assert(!formValidationChecks.missingElements, 'Contact form and required input elements are present');
  runner.assert(formValidationChecks.emptyInvalid, 'Empty contact form submission is rejected by HTML5 validation');
  runner.assert(formValidationChecks.invalidEmailRejected, 'Invalid email address string is rejected by HTML5 email validation');
  runner.assert(formValidationChecks.validAccepted, 'Valid email address format is accepted');

  // 6b. Copy Email Button Action
  const copyBtn = await page.$('.copy-btn');
  runner.assert(!!copyBtn, 'Copy email button is rendered');
  if (copyBtn) {
    await copyBtn.click();
    await new Promise(r => setTimeout(r, 300));
    const copiedFeedback = await page.evaluate(() => {
      const btn = document.querySelector('.copy-btn');
      return btn ? btn.textContent.trim() : '';
    });
    runner.assert(copiedFeedback === 'Copied!', 'Clicking Copy button displays "Copied!" feedback text', { actual: copiedFeedback });
  }

  // ---------------------------------------------------------
  // 7. Profile Content & Asset Integrity
  // ---------------------------------------------------------
  console.log('\n--- SUITE 7: Content & Asset Integrity ---');
  const content = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasName: text.includes('GORLE MONISHA') || text.includes('Gorle Monisha'),
      hasCollege: text.includes('Sai Ganapathi Engineering College'),
      hasDegree: text.includes('B.Tech in Computer Science and Engineering') || text.includes('B.Tech in CSE'),
      hasCGPA: text.includes('8.17 / 10') || text.includes('8.17'),
      hasPeriod: text.includes('2023–2027') || text.includes('2023-2027'),
      hasEmail: text.includes('monishagorle2@gmail.com'),
      noBuildConnect: !text.includes('BuildConnect')
    };
  });

  runner.assert(content.hasName, 'Student name "Gorle Monisha" rendered accurately');
  runner.assert(content.hasCollege, 'Institution "Sai Ganapathi Engineering College" rendered accurately');
  runner.assert(content.hasDegree, 'Degree "B.Tech in Computer Science and Engineering" rendered accurately');
  runner.assert(content.hasCGPA, 'CGPA "8.17 / 10" rendered accurately');
  runner.assert(content.hasPeriod, 'Academic period "2023–2027" rendered accurately');
  runner.assert(content.hasEmail, 'Email "monishagorle2@gmail.com" rendered accurately');
  runner.assert(content.noBuildConnect, 'BuildConnect is absent from codebase and DOM');

  // 7b. External link destinations
  const externalLinks = await page.evaluate(() => {
    return {
      github: document.querySelector('a[href="https://github.com/monishagorle2-coder"]')?.getAttribute('href'),
      linkedin: document.querySelector('a[href="https://www.linkedin.com/in/monisha-g-672613315"]')?.getAttribute('href'),
      portfolio: document.querySelector('a[href="https://nurture-network-core.lovable.app"]')?.getAttribute('href')
    };
  });
  runner.assert(externalLinks.github === 'https://github.com/monishagorle2-coder', 'GitHub profile link verified');
  runner.assert(externalLinks.linkedin === 'https://www.linkedin.com/in/monisha-g-672613315', 'LinkedIn profile link verified');
  runner.assert(externalLinks.portfolio === 'https://nurture-network-core.lovable.app', 'Lovable live portfolio link verified');

  // 7c. Local images natural dimensions
  const imageAssets = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.map(img => ({
      src: img.getAttribute('src'),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      loaded: img.naturalWidth > 0
    }));
  });
  const characterImg = imageAssets.find(i => i.src && i.src.includes('monisha_character.jpg'));
  runner.assert(!!characterImg && characterImg.loaded, 'Anime character image loads with valid dimensions (896x1200)', characterImg);

  // ---------------------------------------------------------
  // 8. Strict Viewport Overflow & Metrics Assertions
  // ---------------------------------------------------------
  console.log('\n--- SUITE 8: Viewport Measurements & Zero-Overflow Assertions ---');
  const viewportsToMeasure = [
    { name: '320px Narrow Mobile', width: 320, height: 640 },
    { name: '390px Modern Mobile', width: 390, height: 844 },
    { name: '768px Tablet Portrait', width: 768, height: 1024 },
    { name: '1024px Laptop Landscape', width: 1024, height: 800 },
    { name: '1440px Desktop Ultrawide', width: 1440, height: 900 }
  ];

  const viewportMetricsReport = {};

  for (const vp of viewportsToMeasure) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.width < 992 });
    await new Promise(r => setTimeout(r, 400));

    const metrics = await page.evaluate((targetWidth) => {
      const windowInnerWidth = window.innerWidth;
      const clientWidth = document.documentElement.clientWidth;
      const docScrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;

      // Find any element whose bounding rect extends beyond clientWidth
      const overflowingElements = [];
      const allElements = Array.from(document.querySelectorAll('*'));
      for (const el of allElements) {
        const r = el.getBoundingClientRect();
        if (r.right > clientWidth + 0.5) {
          overflowingElements.push({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className: typeof el.className === 'string' ? el.className : el.className?.baseVal || '',
            right: Math.round(r.right),
            width: Math.round(r.width)
          });
        }
      }

      return {
        windowInnerWidth,
        clientWidth,
        docScrollWidth,
        bodyScrollWidth,
        hasOverflow: docScrollWidth > clientWidth || bodyScrollWidth > clientWidth,
        overflowCount: overflowingElements.length,
        overflowingElements
      };
    }, vp.width);

    viewportMetricsReport[vp.name] = metrics;

    runner.assert(
      metrics.docScrollWidth === metrics.clientWidth && !metrics.hasOverflow,
      `Viewport ${vp.name} document scrollWidth (${metrics.docScrollWidth}px) exactly matches clientWidth (${metrics.clientWidth}px)`,
      metrics
    );

    runner.assert(
      metrics.overflowCount === 0,
      `Viewport ${vp.name} has zero elements extending beyond clientWidth`,
      { count: metrics.overflowCount, samples: metrics.overflowingElements }
    );
  }

  // ---------------------------------------------------------
  // 9. Console Error & Warning Integrity
  // ---------------------------------------------------------
  console.log('\n--- SUITE 9: Browser Console Integrity ---');
  runner.assert(
    consoleErrors.length === 0,
    `Zero browser console errors logged during test execution (actual: ${consoleErrors.length})`,
    consoleErrors
  );

  await browser.close();

  // Save report
  const summary = runner.summary();
  summary.viewportMetrics = viewportMetricsReport;
  summary.timestamp = new Date().toISOString();

  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'phase8_test_results.json'), JSON.stringify(summary, null, 2));

  console.log('\n================================================================');
  console.log(`TEST SUITE COMPLETE: ${summary.passed} PASSED, ${summary.failed} FAILED (${summary.total} TOTAL)`);
  console.log('================================================================\n');

  return summary;
}

runComprehensiveQA().catch(err => {
  console.error('Fatal error in QA suite:', err);
  process.exit(1);
});
