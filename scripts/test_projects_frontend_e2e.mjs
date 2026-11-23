import puppeteer from 'puppeteer-core';

async function runFrontendE2ETest() {
  console.log('====================================================');
  console.log('🧪 STAGE 7: REAL BROWSER PROJECTS INTEGRATION TEST');
  console.log('Frontend URL: http://localhost:4173');
  console.log('Backend API:  http://localhost:5000/api/projects');
  console.log('====================================================\n');

  let browser;
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

  try {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Skip intro animation for fast automated testing
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('monisha_intro_viewed', 'true');
    });

    // ----------------------------------------------------
    // TEST 1: Page Navigation and Projects Loading from API
    // ----------------------------------------------------
    console.log('--- TEST 1: Page Load & API Project Retrieval ---');
    
    const apiPromise = page.waitForResponse(
      response => response.url().includes('/api/projects') && response.status() === 200,
      { timeout: 15000 }
    );

    await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const apiResponse = await apiPromise;
    assert(Boolean(apiResponse), 'Frontend successfully called GET /api/projects with HTTP 200');

    // Wait for project cards
    await page.waitForSelector('.project-card:not(.project-card-skeleton)', { timeout: 10000 });
    const projectCards = await page.$$('.project-card:not(.project-card-skeleton)');
    assert(projectCards.length === 2, `Rendered exactly 2 project cards from database API (got: ${projectCards.length})`);

    // Verify titles of both cards
    const titles = await page.$$eval('.project-card:not(.project-card-skeleton) .project-title', els => els.map(e => e.textContent.trim()));
    assert(titles[0] === 'MediAssist V2', `Card 1 Title: "${titles[0]}"`);
    assert(titles[1] === 'Cinematic Inventory & Wholesale Management System', `Card 2 Title: "${titles[1]}"`);

    // Verify Project 01 & Project 02 badges
    const badges = await page.$$eval('.project-index-badge span:first-child', els => els.map(e => e.textContent.trim()));
    assert(badges[0] === 'PROJECT 01', `Card 1 Index: "${badges[0]}"`);
    assert(badges[1] === 'PROJECT 02', `Card 2 Index: "${badges[1]}"`);

    // ----------------------------------------------------
    // TEST 2: Project Modal for Project 1 (MediAssist V2)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Project Modal 1 (MediAssist V2) ---');
    await page.evaluate(() => {
      const btns = document.querySelectorAll('.btn-case-study');
      if (btns[0]) btns[0].click();
    });

    await page.waitForSelector('.modal-panel.project-modal-panel', { timeout: 5000 });
    const modal1Title = await page.$eval('.project-modal-title', el => el.textContent.trim());
    assert(modal1Title === 'MediAssist V2', `Modal 1 Title verified: "${modal1Title}"`);

    const hasProblemCard = await page.$('.problem-card');
    const hasSolutionCard = await page.$('.solution-card');
    assert(Boolean(hasProblemCard), 'Case study "Problem" card rendered in Modal 1');
    assert(Boolean(hasSolutionCard), 'Case study "Solution" card rendered in Modal 1');

    // Close modal 1
    await page.click('.modal-close-btn');
    await new Promise(r => setTimeout(r, 400));
    const modal1Closed = (await page.$('.project-modal-panel')) === null;
    assert(modal1Closed, 'Modal 1 closed successfully');

    // ----------------------------------------------------
    // TEST 3: Project Modal for Project 2 (Inventory Wholesale)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Project Modal 2 (Inventory Wholesale) ---');
    await page.evaluate(() => {
      const btns = document.querySelectorAll('.btn-case-study');
      if (btns[1]) btns[1].click();
    });

    await page.waitForSelector('.modal-panel.project-modal-panel', { timeout: 5000 });
    const modal2Title = await page.$eval('.project-modal-title', el => el.textContent.trim());
    assert(modal2Title === 'Cinematic Inventory & Wholesale Management System', `Modal 2 Title verified: "${modal2Title}"`);

    const hasAuditMatrix = await page.$('.audit-matrix-section');
    const hasFlowSteps = await page.$('.technical-flow-wrap');
    assert(Boolean(hasAuditMatrix), 'Audit Matrix section rendered in Modal 2');
    assert(Boolean(hasFlowSteps), 'Technical flow pipeline rendered in Modal 2');

    // Close modal 2 via ESC key
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
    const modal2Closed = (await page.$('.project-modal-panel')) === null;
    assert(modal2Closed, 'Modal 2 closed successfully with Escape key');

    // ----------------------------------------------------
    // TEST 4: Viewport Responsiveness (Desktop vs Mobile)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Responsive Layout Checks ---');
    // Mobile Viewport (iPhone SE: 375x667)
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(r => setTimeout(r, 300));
    const mobileColumns = await page.$eval('.projects-grid', el => window.getComputedStyle(el).gridTemplateColumns);
    console.log(`   Mobile .projects-grid columns: "${mobileColumns}"`);
    assert(!mobileColumns.includes(' '), 'Mobile layout stacks cards in single column (1fr)');

    // Desktop Viewport (1280x800)
    await page.setViewport({ width: 1280, height: 800 });
    await new Promise(r => setTimeout(r, 300));
    const desktopColumns = await page.$eval('.projects-grid', el => window.getComputedStyle(el).gridTemplateColumns);
    console.log(`   Desktop .projects-grid columns: "${desktopColumns}"`);
    assert(desktopColumns.includes(' '), 'Desktop layout uses 2-column grid');

    // ----------------------------------------------------
    // TEST 5: Theme Switching (Dark & Light)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Dark and Light Theme Checks ---');
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    console.log(`   Initial data-theme: "${initialTheme}"`);

    // Click .nav-theme-btn
    await page.click('.nav-theme-btn');
    await new Promise(r => setTimeout(r, 300));
    const toggledTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    console.log(`   Toggled data-theme: "${toggledTheme}"`);
    assert(toggledTheme !== initialTheme, `Theme toggled successfully from ${initialTheme} to ${toggledTheme}`);

    // Toggle back to original theme
    await page.click('.nav-theme-btn');
    await new Promise(r => setTimeout(r, 300));
    const revertedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(revertedTheme === initialTheme, `Theme successfully reverted back to ${initialTheme}`);

    // ----------------------------------------------------
    // TEST 6: Error State and Retry Flow
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Error State & Retry Flow (Simulated API Failure) ---');
    const errorPage = await browser.newPage();
    await errorPage.evaluateOnNewDocument(() => {
      sessionStorage.setItem('monisha_intro_viewed', 'true');
    });

    await errorPage.setRequestInterception(true);
    let shouldFail = true;

    errorPage.on('request', req => {
      if (req.url().includes('/api/projects') && shouldFail) {
        req.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'error', message: 'Simulated server error' })
        });
      } else {
        req.continue();
      }
    });

    await errorPage.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await errorPage.waitForSelector('.projects-error-banner', { timeout: 8000 });
    const errorTitle = await errorPage.$eval('.projects-error-title', el => el.textContent.trim());
    assert(errorTitle === 'Unable to Load Projects from Database', `Error banner displayed: "${errorTitle}"`);

    const retryBtn = await errorPage.$('.projects-retry-btn');
    assert(Boolean(retryBtn), 'Retry button is present in error banner');

    // Turn off failure simulation and click retry
    shouldFail = false;
    await errorPage.evaluate(() => {
      const btn = document.querySelector('.projects-retry-btn');
      if (btn) {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
      }
    });

    await errorPage.waitForSelector('.project-card:not(.project-card-skeleton)', { timeout: 10000 });
    const recoveredCards = await errorPage.$$('.project-card:not(.project-card-skeleton)');
    assert(recoveredCards.length === 2, `Retry recovered project cards successfully (count: ${recoveredCards.length})`);

    await errorPage.close();

  } catch (err) {
    console.error('❌ E2E Browser Test Failed:', err);
    failed++;
  } finally {
    if (browser) await browser.close();
  }

  console.log('\n====================================================');
  console.log(`BROWSER E2E SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  process.exitCode = failed > 0 ? 1 : 0;
}

runFrontendE2ETest();
