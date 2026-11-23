import { appendContactSubmissionToSheet } from './googleSheets.js';
import { prisma } from '../db.js';

/**
 * Synchronizes a single PostgreSQL contact submission to Google Sheets.
 * Updates tracking fields in PostgreSQL based on the outcome.
 *
 * @param {Object} submission - Database record from contact_submissions
 * @returns {Promise<Object>} sync outcome
 */
export async function syncSubmissionToSheet(submission) {
  if (!submission || !submission.id) {
    throw new Error('Invalid submission provided for synchronization');
  }

  try {
    const sheetResult = await appendContactSubmissionToSheet({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      subject: submission.subject,
      message: submission.message,
      submittedAt: submission.createdAt ? new Date(submission.createdAt).toISOString() : new Date().toISOString()
    });

    // Mark as synchronized in PostgreSQL
    const updated = await prisma.contactSubmission.update({
      where: { id: submission.id },
      data: {
        sheetSynced: true,
        sheetSyncedAt: new Date(),
        sheetSyncError: null
      }
    });

    return {
      success: true,
      alreadyExists: sheetResult.alreadyExists,
      submissionId: updated.id
    };
  } catch (error) {
    const errorMsg = error.message || 'Unknown Google Sheets synchronization error';

    // Update retry attempts and error message in PostgreSQL
    await prisma.contactSubmission.update({
      where: { id: submission.id },
      data: {
        sheetSynced: false,
        sheetSyncError: errorMsg.slice(0, 500),
        sheetSyncAttempts: { increment: 1 }
      }
    }).catch(dbErr => {
      console.error('Failed to update sync failure status in PostgreSQL:', dbErr.message);
    });

    console.warn(`[Sync Warning] Failed to sync submission ${submission.id} to Google Sheets:`, errorMsg);
    return {
      success: false,
      error: errorMsg,
      submissionId: submission.id
    };
  }
}

/**
 * Retries synchronization for all pending contact submissions.
 * Idempotent: ensures no duplicate rows are created in Google Sheets.
 *
 * @param {Object} options
 * @param {number} [options.maxBatch=20] - Maximum records to process per run
 * @returns {Promise<Object>} retry summary
 */
export async function retryPendingSheetSync({ maxBatch = 20 } = {}) {
  try {
    const pending = await prisma.contactSubmission.findMany({
      where: {
        sheetSynced: false,
        sheetSyncAttempts: { lt: 10 } // Allow up to 10 retry attempts
      },
      orderBy: { createdAt: 'asc' },
      take: maxBatch
    });

    if (pending.length === 0) {
      return { totalPending: 0, succeeded: 0, failed: 0 };
    }

    let succeeded = 0;
    let failed = 0;

    for (const record of pending) {
      const result = await syncSubmissionToSheet(record);
      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }
    }

    return {
      totalPending: pending.length,
      succeeded,
      failed
    };
  } catch (err) {
    console.error('Error during pending submissions retry job:', err.message);
    return { error: err.message };
  }
}

/**
 * Initializes an automated background synchronization worker.
 * Runs periodically to retry any un-synced submissions without blocking Express routes.
 *
 * @param {number} [intervalMs=300000] - 5 minutes by default
 */
export function startBackgroundSyncWorker(intervalMs = 5 * 60 * 1000) {
  // Run an initial check after 10 seconds of server boot
  setTimeout(() => {
    retryPendingSheetSync().catch(() => {});
  }, 10000);

  // Set recurring interval
  const timer = setInterval(() => {
    retryPendingSheetSync().catch(() => {});
  }, intervalMs);

  // Unref timer so it does not block Node process termination in tests
  if (timer && timer.unref) {
    timer.unref();
  }
}
