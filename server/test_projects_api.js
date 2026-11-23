import { prisma } from './src/db.js';

const API_BASE = 'http://localhost:5000/api';

async function runProjectsApiTests() {
  console.log('====================================================');
  console.log('🧪 STAGE 6: PROJECT DATABASE API VERIFICATION SUITE');
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

  try {
    // ----------------------------------------------------
    // TEST 1: Direct Database Verification in Neon PostgreSQL
    // ----------------------------------------------------
    console.log('--- TEST 1: Neon Database Direct Verification ---');
    const totalInDb = await prisma.project.count();
    assert(totalInDb === 2, `Neon database contains exactly 2 projects (got: ${totalInDb})`);

    const allDbProjects = await prisma.project.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    const hasBuildConnect = allDbProjects.some(
      p => p.id.toLowerCase().includes('buildconnect') || p.title.toLowerCase().includes('buildconnect')
    );
    assert(!hasBuildConnect, 'Strict Rule Confirmed: BuildConnect is NOT in the database');

    const project1 = allDbProjects[0];
    const project2 = allDbProjects[1];

    assert(project1?.id === 'mediassist-v2', 'Project 1 ID is "mediassist-v2"');
    assert(project1?.title === 'MediAssist V2', 'Project 1 Title is "MediAssist V2"');
    assert(project1?.displayOrder === 1, 'Project 1 displayOrder is 1');

    assert(project2?.id === 'inventory-wholesale', 'Project 2 ID is "inventory-wholesale"');
    assert(project2?.title === 'Cinematic Inventory & Wholesale Management System', 'Project 2 Title matches');
    assert(project2?.displayOrder === 2, 'Project 2 displayOrder is 2');

    // ----------------------------------------------------
    // TEST 2: GET /api/projects
    // ----------------------------------------------------
    console.log('\n--- TEST 2: GET /api/projects Endpoint ---');
    const resAll = await fetch(`${API_BASE}/projects`);
    const dataAll = await resAll.json();

    assert(resAll.status === 200, `GET /api/projects returned HTTP 200 OK (got: ${resAll.status})`);
    assert(dataAll.status === 'success', 'Response status confirmed "success"');
    assert(dataAll.count === 2, `Response reports count: 2 (got: ${dataAll.count})`);
    assert(Array.isArray(dataAll.data) && dataAll.data.length === 2, 'Response data array contains 2 items');

    const apiP1 = dataAll.data[0];
    const apiP2 = dataAll.data[1];
    assert(apiP1.id === 'mediassist-v2' && apiP1.displayOrder === 1, 'Projects returned in correct displayOrder (1st: MediAssist V2)');
    assert(apiP2.id === 'inventory-wholesale' && apiP2.displayOrder === 2, 'Projects returned in correct displayOrder (2nd: Inventory Wholesale)');

    // Verify key fields on API response
    assert(Array.isArray(apiP1.techStack) && apiP1.techStack.includes('React'), 'MediAssist techStack includes React');
    assert(Boolean(apiP1.caseStudy?.problem), 'MediAssist caseStudy problem is populated');
    assert(Boolean(apiP1.caseStudy?.keyImplementations), 'MediAssist keyImplementations is populated');
    assert(apiP1.links?.github === 'https://github.com/monishagorle2-coder', 'MediAssist GitHub link matches verified profile');
    assert(Array.isArray(apiP2.sampleItems) && apiP2.sampleItems.length === 2, 'Inventory Wholesale sampleItems array verified');
    assert(Boolean(apiP2.auditMatrix?.implemented), 'Inventory Wholesale auditMatrix verified');

    // ----------------------------------------------------
    // TEST 3: GET /api/projects/:id (Valid IDs)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: GET /api/projects/:id (Valid IDs) ---');
    const resSingle1 = await fetch(`${API_BASE}/projects/mediassist-v2`);
    const dataSingle1 = await resSingle1.json();
    assert(resSingle1.status === 200, 'GET /api/projects/mediassist-v2 returned HTTP 200 OK');
    assert(dataSingle1.data?.title === 'MediAssist V2', 'Returned correct MediAssist V2 object');

    const resSingle2 = await fetch(`${API_BASE}/projects/inventory-wholesale`);
    const dataSingle2 = await resSingle2.json();
    assert(resSingle2.status === 200, 'GET /api/projects/inventory-wholesale returned HTTP 200 OK');
    assert(dataSingle2.data?.title === 'Cinematic Inventory & Wholesale Management System', 'Returned correct Inventory Wholesale object');

    // ----------------------------------------------------
    // TEST 4: GET /api/projects/:id (Invalid / Non-Existent ID)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: GET /api/projects/:id (Invalid ID 404 Check) ---');
    const resNotFound = await fetch(`${API_BASE}/projects/non-existent-project-xyz`);
    const dataNotFound = await resNotFound.json();
    assert(resNotFound.status === 404, `GET non-existent project returned HTTP 404 (got: ${resNotFound.status})`);
    assert(dataNotFound.status === 'error', 'Error status confirmed "error"');
    assert(dataNotFound.message?.includes('not found'), `Safe error message returned: "${dataNotFound.message}"`);

    // ----------------------------------------------------
    // TEST 5: Regression Check on Contact & Health APIs
    // ----------------------------------------------------
    console.log('\n--- TEST 5: System Regression Checks ---');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'Health endpoint remains 200 OK');

    const contactValRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(contactValRes.status === 400, 'Contact form validation still returns HTTP 400 for empty payloads');

  } catch (err) {
    console.error('❌ Test failed with unexpected error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  process.exitCode = failed > 0 ? 1 : 0;
}

runProjectsApiTests();
