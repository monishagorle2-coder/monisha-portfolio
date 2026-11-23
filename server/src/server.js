import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import contactRouter from './routes/contact.js';
import projectsRouter from './routes/projects.js';
import { startBackgroundSyncWorker } from './services/syncService.js';
import { prisma } from './db.js';

// 1. Load environment variables from server/.env file (robust to CWD)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to CWD if any extra vars exist

// 2. Initialize the Express application
const app = express();

// 3. Define the server host, port, and allowed client origins
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const defaultOrigins = ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173'];
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

// 4. Configure CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Exact matches or wildcard
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Allow Vercel preview or production deployments automatically
    try {
      const url = new URL(origin);
      if (url.hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    } catch {
      // Ignore URL parsing errors
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 5. Middleware for parsing incoming JSON request bodies
app.use(express.json());

// 6. Health Check Endpoint (suitable for Render health checks and monitors)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'healthy';
  try {
    // Quick probe to confirm Neon database responsiveness
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'degraded';
  }

  res.status(200).json({
    status: dbStatus === 'healthy' ? 'ok' : 'degraded',
    message: 'Portfolio Backend Server is running successfully',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`
  });
});

// 7. Mount Feature API Routes
app.use('/api', contactRouter);
app.use('/api', projectsRouter);

// 8. Catch-all route for unhandled endpoints (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found on this server`
  });
});

// 9. Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error encountered:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error occurred'
  });
});

// 10. Start listening for incoming network requests
const server = app.listen(PORT, HOST, () => {
  console.log(`===============================================`);
  console.log(`🚀 Portfolio Backend Server started`);
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`🩺 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🔒 Allowed CORS Origins: ${allowedOrigins.join(', ')}`);
  console.log(`===============================================`);

  // Start background self-healing worker to retry any un-synced submissions to Google Sheets
  startBackgroundSyncWorker();
});

// 11. Graceful shutdown handler for container/cloud platforms (Render SIGTERM/SIGINT)
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down server...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('Prisma database connection closed successfully.');
    } catch (err) {
      console.error('Error disconnecting Prisma:', err.message);
    }
    process.exit(0);
  });

  // Force shutdown after timeout if pending operations hang
  setTimeout(() => {
    console.error('Graceful shutdown timeout exceeded. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
