import http from 'http';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json, rawBody: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: null, rawBody: data });
        }
      });
    });
    req.on('error', reject);
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 STAGE 1 BACKEND VERIFICATION SUITE');
  console.log('====================================================\n');

  let allPassed = true;

  // Test 1: GET /api/health
  console.log('1. Testing GET /api/health...');
  try {
    const res = await makeRequest('/api/health');
    console.log(`   HTTP Status Code: ${res.status}`);
    console.log(`   Response Body:`, JSON.stringify(res.body, null, 2));

    if (res.status === 200 && res.body && res.body.status === 'ok') {
      console.log('   ✔ [PASS] /api/health returned HTTP 200 with status "ok"\n');
    } else {
      console.error('   ❌ [FAIL] /api/health failed to return expected response\n');
      allPassed = false;
    }
  } catch (err) {
    console.error(`   ❌ [FAIL] Error connecting to /api/health: ${err.message}\n`);
    allPassed = false;
  }

  // Test 2: GET /api/nonexistent (Unknown Route 404)
  console.log('2. Testing GET /api/nonexistent (Unknown Route)...');
  try {
    const res404 = await makeRequest('/api/nonexistent');
    console.log(`   HTTP Status Code: ${res404.status}`);
    console.log(`   Response Body:`, JSON.stringify(res404.body, null, 2));

    if (res404.status === 404 && res404.body && res404.body.status === 'error') {
      console.log('   ✔ [PASS] Unknown route returned HTTP 404 with structured JSON error\n');
    } else {
      console.error('   ❌ [FAIL] Unknown route did not return HTTP 404 JSON response\n');
      allPassed = false;
    }
  } catch (err) {
    console.error(`   ❌ [FAIL] Error connecting to /api/nonexistent: ${err.message}\n`);
    allPassed = false;
  }

  console.log('====================================================');
  if (allPassed) {
    console.log('🎉 ALL STAGE 1 ENDPOINT CHECKS PASSED SUCCESSFULLY!');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error('❌ SOME STAGE 1 ENDPOINT CHECKS FAILED');
    console.log('====================================================');
    process.exit(1);
  }
}

runTests();
