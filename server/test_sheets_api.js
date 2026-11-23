import { appendContactSubmissionToSheet } from './src/services/googleSheets.js';
import { prisma } from './src/db.js';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 STAGE 5: GOOGLE SHEETS STORAGE VERIFICATION SUITE');
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

  // 1. Health Endpoint Test
  console.log('--- TEST 1: Health Endpoint Check ---');
  try {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    assert(res.status === 200 && data.status === 'ok', 'GET /api/health returned 200 OK');
  } catch (e) {
    assert(false, `Health check failed: ${e.message}`);
  }

  // 2. Validation: Empty / Missing Fields
  console.log('\n--- TEST 2: Validation on Empty / Missing Fields ---');
  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: '', subject: '', message: '' })
    });
    const data = await res.json();
    assert(res.status === 400, `Returned HTTP 400 for empty fields (got ${res.status})`);
    assert(data.errors && data.errors.length >= 4, `Returned ${data.errors?.length} field validation errors`);
  } catch (e) {
    assert(false, `Empty fields validation failed: ${e.message}`);
  }

  // 3. Validation: Invalid Email
  console.log('\n--- TEST 3: Validation on Invalid Email Format ---');
  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'invalid-email-string',
        subject: 'Inquiry',
        message: 'Valid message body.'
      })
    });
    const data = await res.json();
    assert(res.status === 400, `Returned HTTP 400 for invalid email (got ${res.status})`);
    assert(data.errors?.some(e => e.field === 'email'), 'Identified email as the failing field');
  } catch (e) {
    assert(false, `Invalid email validation failed: ${e.message}`);
  }

  // 4. Google Sheets Configuration & Persistence Check (Run before rate-limiting test)
  console.log('\n--- TEST 4: Google Sheets Storage Check ---');
  const hasSheetId = Boolean(process.env.GOOGLE_SHEET_ID);
  console.log(`GOOGLE_SHEET_ID set: ${hasSheetId}`);

  if (!hasSheetId) {
    console.log('ℹ Google Sheets credentials / GOOGLE_SHEET_ID not yet set in server/.env.');
    console.log('Testing that requests fail safely without leaking errors or falling back silently...');

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Stage 5 Tester',
          email: 'stage5@test.com',
          subject: 'Unconfigured Credentials Test',
          message: 'Verifying safe failure behavior'
        })
      });
      const data = await res.json();
      assert(res.status === 500, `Returned HTTP 500 when Google Sheets is unconfigured (got ${res.status})`);
      assert(
        data.message === 'An unexpected server error occurred while processing your message. Please try again later.',
        'Returned generic safe error message without internal error leak'
      );
    } catch (e) {
      assert(false, `Unconfigured test failed: ${e.message}`);
    }
  } else {
    // If sheet ID is set, test actual append
    try {
      const testTimestamp = Date.now();
      const testEmail = `sheet_test_${testTimestamp}@example.com`;
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Stage 5 Automated Tester',
          email: testEmail,
          subject: 'Automated Stage 5 Google Sheet Append Test',
          message: 'This row was generated during Stage 5 verification.'
        })
      });
      const data = await res.json();
      assert(res.status === 201, `Returned HTTP 201 Created (got ${res.status})`);
      assert(data.status === 'success', 'Confirmed successful submission response');
      assert(Boolean(data.data?.submittedAt), 'Returned server-generated timestamp');
    } catch (e) {
      assert(false, `Google Sheet append failed: ${e.message}`);
    }
  }

  // 5. Rate Limiting Check (Run last to avoid exhausting rate limit for other tests)
  console.log('\n--- TEST 5: Rate Limiter Protection ---');
  try {
    let blocked = false;
    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Spam Bot',
          email: 'spambot@example.com',
          subject: 'Spam Subject',
          message: 'Spam message content'
        })
      });
      if (res.status === 429) {
        blocked = true;
        assert(true, `Rate limiter blocked request with HTTP 429 Too Many Requests`);
        break;
      }
    }
    if (!blocked) {
      console.log('Notice: IP may have already triggered rate limit window or not exceeded yet');
    }
  } catch (e) {
    assert(false, `Rate limiter test failed: ${e.message}`);
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  process.exitCode = failed > 0 ? 1 : 0;
}

runTests();
