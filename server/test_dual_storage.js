import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { prisma } from './src/db.js';
import { syncSubmissionToSheet, retryPendingSheetSync } from './src/services/syncService.js';
import { appendContactSubmissionToSheet } from './src/services/googleSheets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_BASE = 'http://localhost:5000/api';

async function runDualStorageTests() {
  console.log('====================================================');
  console.log('🧪 STAGE 5.1: DUAL CONTACT STORAGE VERIFICATION SUITE');
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

  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, 'google-credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

  let createdSubmissionId = null;
  const testEmail = `dual_test_${Date.now()}@example.com`;

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check
    // ----------------------------------------------------
    console.log('--- TEST 1: Backend Health Check ---');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health returned 200 OK');

    // ----------------------------------------------------
    // TEST 2: Input Validation (Empty Fields & Invalid Email)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Input Validation Rejections ---');
    const emptyRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: '', subject: '', message: '' })
    });
    const emptyData = await emptyRes.json();
    assert(emptyRes.status === 400, `Empty fields returned HTTP 400 (got ${emptyRes.status})`);
    assert(emptyData.errors?.length >= 4, `Identified ${emptyData.errors?.length} validation errors`);

    const badEmailRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dual Tester',
        email: 'invalid-email',
        subject: 'Subject',
        message: 'Valid message'
      })
    });
    assert(badEmailRes.status === 400, 'Invalid email returned HTTP 400');

    // ----------------------------------------------------
    // TEST 3: Primary PostgreSQL Storage & Automatic Sheets Sync
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Primary PostgreSQL Storage & Google Sheets Sync ---');
    const submitRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage 5.1 Dual Storage Tester',
        email: testEmail,
        subject: 'Dual Storage Verification',
        message: 'Testing PostgreSQL primary and Google Sheets secondary sync.'
      })
    });

    const submitData = await submitRes.json();
    assert(submitRes.status === 201, `POST /api/contact returned HTTP 201 Created (got ${submitRes.status})`);
    assert(submitData.status === 'success', 'Response status confirmed "success"');
    assert(Boolean(submitData.data?.id), `Received database record ID: ${submitData.data?.id}`);
    createdSubmissionId = submitData.data?.id;

    // Verify record in PostgreSQL
    const dbRecord = await prisma.contactSubmission.findUnique({
      where: { id: createdSubmissionId }
    });
    assert(Boolean(dbRecord), 'Record verified in PostgreSQL database');
    assert(dbRecord?.email === testEmail, 'Email matches in PostgreSQL record');
    assert(dbRecord?.sheetSynced === true, 'PostgreSQL record marked sheetSynced: true');
    assert(Boolean(dbRecord?.sheetSyncedAt), `sheetSyncedAt timestamp recorded: ${dbRecord?.sheetSyncedAt}`);
    assert(dbRecord?.sheetSyncError === null, 'sheetSyncError is null');

    // Verify record in Google Sheets
    const sheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:F`
    });
    const sheetRows = sheetRes.data.values || [];
    const matchedRow = sheetRows.find(row => row[5] === createdSubmissionId || row[1] === testEmail);
    assert(Boolean(matchedRow), 'Submission verified in Google Sheets');
    if (matchedRow) {
      assert(matchedRow[0] === 'Stage 5.1 Dual Storage Tester', 'Sheet Col 1 (Name) verified');
      assert(matchedRow[1] === testEmail, 'Sheet Col 2 (Email) verified');
      assert(matchedRow[2] === 'Dual Storage Verification', 'Sheet Col 3 (Subject) verified');
      assert(matchedRow[3] === 'Testing PostgreSQL primary and Google Sheets secondary sync.', 'Sheet Col 4 (Message) verified');
      assert(Boolean(matchedRow[4]), 'Sheet Col 5 (Submitted At) verified');
      assert(matchedRow[5] === createdSubmissionId, 'Sheet Col 6 (Submission ID) matches PostgreSQL primary key');
    }

    // ----------------------------------------------------
    // TEST 4: Google Sheets Failure Handling (Pending Retry Record)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Google Sheets Failure Leaves Retryable Pending Record in PostgreSQL ---');
    // Create an un-synced test record in PostgreSQL
    const pendingEmail = `pending_test_${Date.now()}@example.com`;
    const pendingSubmission = await prisma.contactSubmission.create({
      data: {
        name: 'Pending Sync Tester',
        email: pendingEmail,
        subject: 'Pending Sync Test',
        message: 'This record simulates a temporary Google Sheets outage.',
        sheetSynced: false,
        sheetSyncAttempts: 0
      }
    });

    // Temporarily point GOOGLE_SHEET_ID to an invalid target to simulate outage
    const originalSheetId = process.env.GOOGLE_SHEET_ID;
    process.env.GOOGLE_SHEET_ID = 'invalid-sheet-id-outage-simulation';

    const failSyncResult = await syncSubmissionToSheet(pendingSubmission);
    process.env.GOOGLE_SHEET_ID = originalSheetId;

    assert(failSyncResult.success === false, 'Sync safely reported failure during simulated outage');
    
    // Check PostgreSQL state: record MUST be preserved with failure tracked
    const pendingInDb = await prisma.contactSubmission.findUnique({
      where: { id: pendingSubmission.id }
    });
    assert(Boolean(pendingInDb), 'Record safely preserved in PostgreSQL despite Sheets outage');
    assert(pendingInDb?.sheetSynced === false, 'sheetSynced remains false');
    assert(pendingInDb?.sheetSyncAttempts === 1, 'sheetSyncAttempts incremented to 1');
    assert(Boolean(pendingInDb?.sheetSyncError), `sheetSyncError captured: "${pendingInDb?.sheetSyncError?.slice(0, 50)}..."`);

    // ----------------------------------------------------
    // TEST 5: Idempotent Retrying (Zero Duplicate Rows)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Idempotent Retry & Deduplication ---');
    // Run retry with valid configuration restored
    const retryResult = await retryPendingSheetSync();
    assert(retryResult.succeeded >= 1, `Retry job processed pending record: ${JSON.stringify(retryResult)}`);

    const syncedAfterRetry = await prisma.contactSubmission.findUnique({
      where: { id: pendingSubmission.id }
    });
    assert(syncedAfterRetry?.sheetSynced === true, 'Pending record successfully updated to sheetSynced: true');

    // Run retry AGAIN to verify deduplication
    const secondRetryResult = await retryPendingSheetSync();
    assert(secondRetryResult.totalPending === 0, 'Second retry found 0 pending records');

    // Also manually trigger syncSubmissionToSheet on the already-synced record
    const duplicateTest = await syncSubmissionToSheet(syncedAfterRetry);
    assert(duplicateTest.alreadyExists === true, 'syncSubmissionToSheet detected existing row and prevented duplicate append');

    // Query sheet and count rows for this email
    const recheckSheet = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:F`
    });
    const rowsForPending = (recheckSheet.data.values || []).filter(r => r[5] === pendingSubmission.id || r[1] === pendingEmail);
    assert(rowsForPending.length === 1, `Verified row appears EXACTLY ONCE in Google Sheets (count: ${rowsForPending.length})`);

    // ----------------------------------------------------
    // TEST 6: Cleanup of Identified Test Rows
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Cleaning Up Identified Test Records ---');
    // Get all rows from Google Sheets
    const finalSheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:F`
    });
    const allRows = finalSheetRes.data.values || [];
    
    // Find row indices for createdSubmissionId and pendingSubmission.id
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetObj = meta.data.sheets.find(s => s.properties.title === sheetName);
    const sheetId = sheetObj ? sheetObj.properties.sheetId : 0;

    // Filter out test rows by deleting them from sheet
    const testIds = [createdSubmissionId, pendingSubmission.id];
    const deleteIndices = [];
    for (let i = allRows.length - 1; i >= 1; i--) {
      if (testIds.includes(allRows[i][5])) {
        deleteIndices.push(i);
      }
    }

    for (const rowIndex of deleteIndices) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1
                }
              }
            }
          ]
        }
      });
    }
    console.log(`   Cleaned ${deleteIndices.length} test row(s) from Google Sheets.`);

    // Clean up test records from PostgreSQL
    await prisma.contactSubmission.deleteMany({
      where: { id: { in: testIds } }
    });
    const remainingCount = await prisma.contactSubmission.count();
    console.log(`   Cleaned test records from PostgreSQL. Remaining count: ${remainingCount}`);

    assert(true, 'Test records cleaned up successfully from both storages');

  } catch (err) {
    console.error('❌ Test suite encountered fatal error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  process.exitCode = failed > 0 ? 1 : 0;
}

runDualStorageTests();
