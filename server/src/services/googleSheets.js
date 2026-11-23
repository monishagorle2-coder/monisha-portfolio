import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolves the Google Auth client using either:
 * 1. A JSON key file (e.g. server/google-credentials.json or GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
 * 2. Environment variables (GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY)
 */
function getGoogleAuthClient() {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

  // Check 1: Key file via explicit environment variable or default file locations
  const keyPathCandidates = [
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    '/etc/secrets/google-credentials.json', // Render secret file default mount path
    '/etc/secrets/google-key.json',
    path.resolve(__dirname, '../../google-credentials.json'),
    path.resolve(__dirname, '../../google-key.json'),
    path.resolve(process.cwd(), 'google-credentials.json'),
    path.resolve(process.cwd(), 'server/google-credentials.json')
  ].filter(Boolean);

  for (const candidate of keyPathCandidates) {
    const resolved = path.isAbsolute(candidate) ? candidate : path.resolve(__dirname, '../../', candidate);
    if (fs.existsSync(resolved)) {
      return new google.auth.GoogleAuth({
        keyFile: resolved,
        scopes
      });
    }
  }

  // Check 2: Direct JSON payload in environment variable (Render / Cloud environment variable)
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    try {
      const parsedCreds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      return new google.auth.GoogleAuth({
        credentials: parsedCreds,
        scopes
      });
    } catch (parseErr) {
      console.warn('Failed to parse GOOGLE_CREDENTIALS_JSON environment variable:', parseErr.message);
    }
  }

  // Check 3: Base64-encoded JSON payload in environment variable
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8');
      const parsedCreds = JSON.parse(decoded);
      return new google.auth.GoogleAuth({
        credentials: parsedCreds,
        scopes
      });
    } catch (b64Err) {
      console.warn('Failed to parse GOOGLE_CREDENTIALS_BASE64 environment variable:', b64Err.message);
    }
  }

  // Check 4: Environment variables directly
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey
      },
      scopes
    });
  }

  throw new Error(
    'Google Sheets credentials not configured. Please supply a service account key file (server/google-credentials.json or /etc/secrets/google-credentials.json) or set GOOGLE_CREDENTIALS_JSON / GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in server/.env.'
  );
}

/**
 * Appends a contact submission row to Google Sheets with deduplication.
 * Spreadsheet Columns: Name | Email | Subject | Message | Submitted At | Submission ID
 *
 * @param {Object} submission
 * @param {string} submission.id - Primary key from PostgreSQL
 * @param {string} submission.name
 * @param {string} submission.email
 * @param {string} submission.subject
 * @param {string} submission.message
 * @param {string} [submission.submittedAt]
 * @returns {Promise<Object>} confirmation result
 */
export async function appendContactSubmissionToSheet({ id, name, email, subject, message, submittedAt }) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID is not configured in server/.env.');
  }

  const auth = getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const timestamp = submittedAt || new Date().toISOString();

  // Step 1: Read existing sheet to verify headers and check for existing ID (Deduplication)
  const existingRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:F`
  });

  const existingRows = existingRes.data.values || [];

  // Ensure header row exists and includes Column F (Submission ID)
  if (existingRows.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:F1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Name', 'Email', 'Subject', 'Message', 'Submitted At', 'Submission ID']]
      }
    });
  } else {
    const header = existingRows[0];
    if (header.length < 6 || !header[5]) {
      // Update Column F header to 'Submission ID'
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!F1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Submission ID']]
        }
      });
    }
  }

  // Deduplication check: Check if submission with this database ID already exists in the sheet
  if (id && existingRows.length > 1) {
    const isAlreadyPresent = existingRows.slice(1).some(row => row[5] === id);
    if (isAlreadyPresent) {
      return {
        success: true,
        alreadyExists: true,
        submittedAt: timestamp,
        id
      };
    }
  }

  // Step 2: Append new row to Google Sheets
  const appendRange = `${sheetName}!A:F`;
  const appendResponse = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: appendRange,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [
        [name, email, subject, message, timestamp, id || '']
      ]
    }
  });

  return {
    success: true,
    alreadyExists: false,
    submittedAt: timestamp,
    id,
    updatedRange: appendResponse.data.updates?.updatedRange,
    updatedRows: appendResponse.data.updates?.updatedRows
  };
}
