import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../db.js';
import { syncSubmissionToSheet } from '../services/syncService.js';

const router = Router();

// 1. Rate limiter: Limit to 5 submissions per 15 minutes per IP to prevent spam
export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many contact inquiries from this IP address. Please wait 15 minutes before submitting again.'
    });
  }
});

// 2. Strict Zod validation schema
export const contactSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address format')
    .max(255, 'Email cannot exceed 255 characters'),
  subject: z
    .string({ required_error: 'Subject is required' })
    .trim()
    .min(1, 'Subject cannot be empty')
    .max(200, 'Subject cannot exceed 200 characters'),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(1, 'Message cannot be empty')
    .max(3000, 'Message cannot exceed 3000 characters')
});

// 3. POST /api/contact - Primary PostgreSQL Storage with Synchronized Google Sheets
router.post('/contact', contactRateLimiter, async (req, res) => {
  // Validate request payload
  const validationResult = contactSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    const formattedErrors = validationResult.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed. Please check your submission.',
      errors: formattedErrors
    });
  }

  const { name, email, subject, message } = validationResult.data;

  // STEP 1: PostgreSQL Authoritative Primary Storage
  // Submissions MUST safely persist to PostgreSQL. If this fails, no success is returned.
  let submission;
  try {
    submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        sheetSynced: false,
        sheetSyncAttempts: 0
      }
    });
  } catch (dbError) {
    console.error('Fatal: Failed to save contact submission to PostgreSQL:', dbError.message);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while processing your message. Please try again later.'
    });
  }

  // STEP 2: Google Sheets Synchronization (Secondary Storage)
  // Attempt immediate synchronization. If Sheets is temporarily unavailable,
  // the failure is safely recorded in PostgreSQL for retry without failing the client request.
  try {
    await syncSubmissionToSheet(submission);
  } catch (syncError) {
    console.warn(`[Sync Notice] Immediate Google Sheets sync failed for ${submission.id}:`, syncError.message);
  }

  // STEP 3: Return safe HTTP 201 Created confirmation
  return res.status(201).json({
    status: 'success',
    message: 'Thank you! Your message has been received and saved successfully.',
    data: {
      id: submission.id,
      createdAt: submission.createdAt
    }
  });
});

export default router;
