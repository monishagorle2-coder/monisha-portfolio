import puppeteer from 'puppeteer-core';
import { prisma } from '../server/src/db.js';

async function runE2ETest() {
  console.log('====================================================');
  console.log('🧪 Starting End-to-End Contact Form Integration Test');
  console.log('Frontend: http://localhost:4173');
  console.log('Backend:  http://localhost:5000');
  console.log('Database: Neon PostgreSQL via Prisma 7');
  console.log('====================================================\n');

  let browser;
  const testEmail = `e2e_test_${Date.now()}@example.com`;
  const testName = 'E2E Selenium/Puppeteer Tester';
  const testSubject = 'Automated End-to-End Integration Test';
  const testMessage = 'This message was automatically generated during end-to-end browser verification of Stage 4.';

  try {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(`[Browser ${msg.type()}] ${msg.text()}`));

    console.log('1. Navigating to http://localhost:4173 ...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 15000 });

    console.log('2. Scrolling to #contact section ...');
    await page.evaluate(() => {
      sessionStorage.setItem('monisha_intro_viewed', 'true');
      const contactSec = document.getElementById('contact');
      if (contactSec) contactSec.scrollIntoView();
    });

    await new Promise(r => setTimeout(r, 1000));

    // Check contact form exists
    const formHandle = await page.$('form');
    if (!formHandle) throw new Error('Could not find form element on the page');
    console.log('   [PASS] Found contact form element.');

    const submitBtn = await page.$('button.submit-btn');
    if (!submitBtn) throw new Error('Could not find submit button');
    console.log('   [PASS] Found submit button.');

    // 3. Test Client-side validation: Check HTML5 required attributes
    console.log('\n3. Testing Client-side form constraints (required attributes)...');
    const isNameRequired = await page.$eval('#name', el => el.required);
    const isEmailRequired = await page.$eval('#email', el => el.required);
    const isSubjectRequired = await page.$eval('#subject', el => el.required);
    const isMessageRequired = await page.$eval('#message', el => el.required);

    if (isNameRequired && isEmailRequired && isSubjectRequired && isMessageRequired) {
      console.log('   [PASS] All input fields have client-side required constraints.');
    } else {
      throw new Error('Not all inputs have required attribute');
    }

    // 4. Test Valid Submission
    console.log('\n4. Typing valid test submission into form fields...');
    await page.type('#name', testName);
    await page.type('#email', testEmail);
    await page.type('#subject', testSubject);
    await page.type('#message', testMessage);

    console.log('5. Clicking submit button ...');
    // Scroll button into center view and trigger click
    await page.evaluate(() => {
      const btn = document.querySelector('button.submit-btn');
      btn.scrollIntoView({ block: 'center', inline: 'nearest' });
      btn.click();
    });

    console.log('6. Waiting for API response and success banner ...');
    await page.waitForSelector('.form-success-banner', { timeout: 10000 });
    const successText = await page.$eval('.form-success-banner', el => el.textContent.trim());
    console.log(`   [PASS] Success banner rendered: "${successText}"`);

    // Verify form fields were cleared
    const nameVal = await page.$eval('#name', el => el.value);
    const emailVal = await page.$eval('#email', el => el.value);
    const subjectVal = await page.$eval('#subject', el => el.value);
    const messageVal = await page.$eval('#message', el => el.value);

    if (nameVal === '' && emailVal === '' && subjectVal === '' && messageVal === '') {
      console.log('   [PASS] All form fields were successfully reset after submission.');
    } else {
      throw new Error(`Form fields were not cleared: name="${nameVal}", email="${emailVal}"`);
    }

    // 7. Verify Neon PostgreSQL Database record via Prisma
    console.log('\n7. Verifying record persistence in Neon PostgreSQL...');
    const dbRecord = await prisma.contactSubmission.findFirst({
      where: { email: testEmail }
    });

    if (!dbRecord) {
      throw new Error(`Record with email ${testEmail} not found in Neon database!`);
    }
    console.log('   [PASS] Found submitted record in Neon PostgreSQL:');
    console.log(`          ID: ${dbRecord.id}`);
    console.log(`          Name: ${dbRecord.name}`);
    console.log(`          Email: ${dbRecord.email}`);
    console.log(`          Subject: ${dbRecord.subject}`);
    console.log(`          Created At: ${dbRecord.createdAt.toISOString()}`);

    // 8. Teardown test record
    console.log('\n8. Cleaning up test record from database...');
    await prisma.contactSubmission.delete({
      where: { id: dbRecord.id }
    });
    console.log('   [PASS] Test record cleanly removed from Neon PostgreSQL.');

    console.log('\n====================================================');
    console.log('🎉 ALL END-TO-END CONTACT INTEGRATION TESTS PASSED!');
    console.log('====================================================');

  } catch (err) {
    console.error('\n❌ E2E Test Failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await prisma.$disconnect();
  }
}

runE2ETest();
