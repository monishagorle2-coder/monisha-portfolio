import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { prisma } from './src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_URL = 'http://localhost:5000/api/contact';

async function runLiveTest() {
  console.log('====================================================');
  console.log('🧪 LIVE GOOGLE SHEETS SUBMISSION & CLEANUP TEST');
  console.log('====================================================\n');

  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, 'google-credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

  const testPayload = {
    name: 'Portfolio Integration Test',
    email: 'integration-test@example.com',
    subject: 'Google Sheets Integration Verification',
    message: 'Temporary test submission to verify Google Sheets storage.'
  };

  // Step 1: Send submission to POST /api/contact
  console.log('1. Submitting test record to POST /api/contact ...');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload)
  });

  const resBody = await response.json();
  console.log(`   HTTP Status: ${response.status}`);
  console.log(`   Response Body:`, JSON.stringify(resBody, null, 2));

  if (response.status !== 201) {
    throw new Error(`Expected HTTP 201, got ${response.status}: ${JSON.stringify(resBody)}`);
  }
  console.log('   ✔ [PASS] Returned HTTP 201 Created.');

  // Step 2: Query Google Sheets to verify row insertion
  console.log('\n2. Querying Google Sheet to verify appended row and all 5 columns ...');
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:E`
  });

  const rows = readRes.data.values || [];
  console.log(`   Total rows found in sheet: ${rows.length}`);

  let foundRowIndex = -1;
  let foundRow = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row[0] === testPayload.name && row[1] === testPayload.email) {
      foundRowIndex = i;
      foundRow = row;
      break;
    }
  }

  if (foundRowIndex === -1) {
    throw new Error('Test row was not found in the Google Sheet!');
  }

  console.log(`   ✔ [PASS] Found test row at spreadsheet row ${foundRowIndex + 1}:`);
  console.log(`      Col 1 (Name):         "${foundRow[0]}"`);
  console.log(`      Col 2 (Email):        "${foundRow[1]}"`);
  console.log(`      Col 3 (Subject):      "${foundRow[2]}"`);
  console.log(`      Col 4 (Message):      "${foundRow[3]}"`);
  console.log(`      Col 5 (Submitted At): "${foundRow[4]}"`);

  // Column assertions
  if (foundRow[0] !== testPayload.name) throw new Error('Col 1 (Name) mismatch');
  if (foundRow[1] !== testPayload.email) throw new Error('Col 2 (Email) mismatch');
  if (foundRow[2] !== testPayload.subject) throw new Error('Col 3 (Subject) mismatch');
  if (foundRow[3] !== testPayload.message) throw new Error('Col 4 (Message) mismatch');

  const timestampDate = new Date(foundRow[4]);
  if (isNaN(timestampDate.getTime())) {
    throw new Error(`Col 5 does not contain a valid timestamp: "${foundRow[4]}"`);
  }
  console.log('   ✔ [PASS] All 5 columns verified with exact values and valid server timestamp.');

  // Step 3: Cleanup - remove ONLY the test row from Google Sheets
  console.log('\n3. Cleaning up test row from Google Sheet ...');
  
  // Get the internal sheetId for Sheet1
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetObj = meta.data.sheets.find(s => s.properties.title === sheetName);
  const sheetId = sheetObj ? sheetObj.properties.sheetId : 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: foundRowIndex,
              endIndex: foundRowIndex + 1
            }
          }
        }
      ]
    }
  });

  console.log(`   ✔ [PASS] Deleted row ${foundRowIndex + 1} from Google Sheet.`);

  // Step 4: Confirm removal
  console.log('\n4. Confirming row removal ...');
  const verifyRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:E`
  });
  const afterRows = verifyRes.data.values || [];
  const stillExists = afterRows.some(r => r[0] === testPayload.name && r[1] === testPayload.email);
  if (stillExists) {
    throw new Error('Row was not removed successfully from Google Sheet!');
  }
  console.log(`   ✔ [PASS] Confirmed test row is completely removed. Remaining rows: ${afterRows.length}`);

  // Step 5: Clean up Neon DB if a parallel backup record was written
  console.log('\n5. Checking and cleaning Neon database ...');
  const deletedDb = await prisma.contactSubmission.deleteMany({
    where: { email: testPayload.email }
  });
  console.log(`   Cleaned ${deletedDb.count} test record(s) from Neon database.`);
  const totalDbCount = await prisma.contactSubmission.count();
  console.log(`   Neon database remaining submissions: ${totalDbCount}`);

  console.log('\n====================================================');
  console.log('🎉 LIVE GOOGLE SHEETS INTEGRATION & CLEANUP SUCCESSFUL!');
  console.log('====================================================');
}

runLiveTest()
  .catch((err) => {
    console.error('\n❌ Test failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
