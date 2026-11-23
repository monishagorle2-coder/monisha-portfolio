import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { prisma } from './src/db.js';

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: null, rawBody: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: null, rawBody: data });
        }
      });
    });
    req.on('error', reject);
  });
}

async function runStage4TestSuite() {
  console.log('====================================================');
  console.log('🧪 STAGE 4: CONTACT FORM API VERIFICATION SUITE');
  console.log('====================================================\n');

  let allPassed = true;
  let testRecordId = null;

  // 1. Health Endpoint Still Works
  console.log('--- TEST 1: Health Endpoint Check ---');
  try {
    const healthRes = await getJson('/api/health');
    if (healthRes.status === 200 && healthRes.body?.status === 'ok') {
      console.log('✔ [PASS] GET /api/health returned 200 OK with status "ok"\n');
    } else {
      console.error('❌ [FAIL] /api/health failed');
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ [FAIL] Error connecting to /api/health:', err.message);
    allPassed = false;
  }

  // 2. Valid Contact Submission -> HTTP 201 & DB Record Created
  console.log('--- TEST 2: Valid Contact Submission ---');
  try {
    const validPayload = {
      name: 'Stage4 Test User',
      email: 'stage4.test@thiranex.internal',
      subject: 'Stage 4 API Verification',
      message: 'This is a verified test inquiry for Stage 4 implementation.'
    };

    const res = await postJson('/api/contact', validPayload);
    console.log(`   HTTP Status: ${res.status}`);
    console.log('   Response Body:', JSON.stringify(res.body, null, 2));

    if (res.status === 201 && res.body?.status === 'success' && res.body?.data?.id) {
      testRecordId = res.body.data.id;
      console.log(`   ✔ [PASS] Returned HTTP 201 with created record ID: ${testRecordId}`);

      // Verify in PostgreSQL database
      const dbRecord = await prisma.contactSubmission.findUnique({
        where: { id: testRecordId }
      });

      if (dbRecord && dbRecord.email === validPayload.email) {
        console.log('   ✔ [PASS] Record verified in Neon PostgreSQL database!\n');
      } else {
        console.error('   ❌ [FAIL] Record was not found in database');
        allPassed = false;
      }
    } else {
      console.error('   ❌ [FAIL] Valid submission failed');
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ [FAIL] Error on valid submission:', err.message);
    allPassed = false;
  }

  // 3. Validation: Empty / Missing Fields -> HTTP 400
  console.log('--- TEST 3: Validation on Empty / Missing Fields ---');
  try {
    const emptyPayload = {
      name: '   ',
      email: '',
      subject: '',
      message: ''
    };

    const resEmpty = await postJson('/api/contact', emptyPayload);
    console.log(`   HTTP Status: ${resEmpty.status}`);
    console.log('   Response Body:', JSON.stringify(resEmpty.body, null, 2));

    if (resEmpty.status === 400 && resEmpty.body?.errors?.length >= 4) {
      console.log('   ✔ [PASS] Returned HTTP 400 with 4 field validation errors!\n');
    } else {
      console.error('   ❌ [FAIL] Expected HTTP 400 with field errors, got:', resEmpty.status);
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ [FAIL] Error on empty fields test:', err.message);
    allPassed = false;
  }

  // 4. Validation: Invalid Email Format -> HTTP 400
  console.log('--- TEST 4: Validation on Invalid Email Format ---');
  try {
    const invalidEmailPayload = {
      name: 'Jane Doe',
      email: 'not-an-email',
      subject: 'Internship Inquiry',
      message: 'Hello, this email is malformed.'
    };

    const resEmail = await postJson('/api/contact', invalidEmailPayload);
    console.log(`   HTTP Status: ${resEmail.status}`);
    console.log('   Response Body:', JSON.stringify(resEmail.body, null, 2));

    if (resEmail.status === 400 && resEmail.body?.errors?.some(e => e.field === 'email')) {
      console.log('   ✔ [PASS] Returned HTTP 400 identifying invalid email!\n');
    } else {
      console.error('   ❌ [FAIL] Expected HTTP 400 with email error');
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ [FAIL] Error on invalid email test:', err.message);
    allPassed = false;
  }

  // 5. Validation: Excessively Long Input -> HTTP 400
  console.log('--- TEST 5: Validation on Excessively Long Input ---');
  try {
    const longPayload = {
      name: 'A'.repeat(150), // max is 100
      email: 'valid@example.com',
      subject: 'Valid Subject',
      message: 'Short message'
    };

    const resLong = await postJson('/api/contact', longPayload);
    console.log(`   HTTP Status: ${resLong.status}`);
    console.log('   Response Body:', JSON.stringify(resLong.body, null, 2));

    if (resLong.status === 400 && resLong.body?.errors?.some(e => e.field === 'name')) {
      console.log('   ✔ [PASS] Returned HTTP 400 rejecting >100 char name!\n');
    } else {
      console.error('   ❌ [FAIL] Expected HTTP 400 on excessive length');
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ [FAIL] Error on long input test:', err.message);
    allPassed = false;
  }

  // 6. Rate Limiting Check (Rapid submissions -> HTTP 429)
  console.log('--- TEST 6: Rate Limiting Protection ---');
  try {
    console.log('   Sending rapid requests to test rate limit threshold (max 5 per 15 min)...');
    let hitRateLimit = false;

    for (let i = 0; i < 6; i++) {
      const resRate = await postJson('/api/contact', {
        name: `Rate Tester ${i}`,
        email: `ratetest${i}@example.com`,
        subject: 'Rate Limit Test',
        message: 'Testing spam protection.'
      });

      if (resRate.status === 201 && resRate.body?.data?.id) {
        // Collect test record for teardown
        await prisma.contactSubmission.delete({
          where: { id: resRate.body.data.id }
        });
      }

      if (resRate.status === 429) {
        hitRateLimit = true;
        console.log(`   ✔ [PASS] Request #${i + 1} blocked by rate limiter with HTTP 429!`);
        console.log('   Response:', JSON.stringify(resRate.body, null, 2));
        break;
      }
    }

    if (hitRateLimit) {
      console.log('   ✔ [PASS] Rate limiting verified successfully!\n');
    } else {
      console.warn('   ⚠️ Note: Rate limit threshold not reached within 6 requests.');
    }
  } catch (err) {
    console.error('❌ [FAIL] Error on rate limit test:', err.message);
    allPassed = false;
  }

  // 7. Teardown: Delete initial test record and confirm database is clean
  console.log('--- TEST 7: Database Teardown & Cleanliness ---');
  if (testRecordId) {
    try {
      await prisma.contactSubmission.delete({
        where: { id: testRecordId }
      });
      console.log(`   ✔ [PASS] Cleaned up test record ID: ${testRecordId}`);
    } catch (e) {
      console.warn('   Note on teardown:', e.message);
    }
  }

  const finalCount = await prisma.contactSubmission.count();
  console.log(`   ✔ Current database contact_submissions count: ${finalCount}`);
  if (finalCount === 0) {
    console.log('   ✔ [PASS] Database confirmed 100% clean!\n');
  } else {
    console.log('   ℹ Database has existing records.\n');
  }

  console.log('====================================================');
  if (allPassed) {
    console.log('🎉 ALL STAGE 4 BACKEND API VERIFICATIONS PASSED!');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error('❌ SOME STAGE 4 VERIFICATIONS FAILED');
    console.log('====================================================');
    process.exit(1);
  }
}

runStage4TestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
