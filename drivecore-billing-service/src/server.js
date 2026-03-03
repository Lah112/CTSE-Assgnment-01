require('dotenv').config();

// ---------------------------------------------------------------------------
// Pre-flight environment checks
// Fail immediately with a clear message rather than a cryptic pg timeout.
// ---------------------------------------------------------------------------
if (!process.env.DATABASE_URL) {
  console.error('[Startup] FATAL: DATABASE_URL is not set.');
  console.error('[Startup] Create a .env file (copy .env.example) and add your DATABASE_URL.');
  process.exit(1);
}

if (!process.env.AUTH_SERVICE_URL) {
  console.warn('[Startup] WARNING: AUTH_SERVICE_URL is not set. POST /api/billing will fail.');
}

const express       = require('express');
const helmet        = require('helmet');
const cors          = require('cors');
const pool          = require('./config/db');
const billingRoutes = require('./routes/billingRoutes');
const errorHandler  = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3004;

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

// helmet sets a suite of secure HTTP response headers out-of-the-box:
// Content-Security-Policy, X-Frame-Options, HSTS, X-Content-Type-Options, etc.
app.use(helmet());

// cors restricts cross-origin callers to the configured origin(s).
// In production, replace the origin with your API gateway or frontend domain.
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---------------------------------------------------------------------------
// Body Parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10kb' }));      // cap payload size to mitigate abuse
app.use(express.urlencoded({ extended: false }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/billing', billingRoutes);

// Health check — consumed by Docker/Kubernetes liveness probes and load balancers
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'drivecore-billing-service' });
});

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralised error handler — MUST be registered last
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Auto-Migration
//
// Runs CREATE TABLE IF NOT EXISTS on every container startup.
// This is idempotent: re-running it against an existing table is a no-op.
// No ORM, no migration framework — just raw SQL via the pg driver.
// If the database is not yet ready (e.g. Compose race condition),
// process.exit(1) causes the container to restart and retry.
// ---------------------------------------------------------------------------
const runMigrations = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS billing (
      id         SERIAL PRIMARY KEY,
      user_id    VARCHAR(255)   NOT NULL,
      booking_id VARCHAR(255)   NOT NULL,
      amount     DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      status     VARCHAR(50)    NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableSQL);
    console.log('[Migration] billing table is ready.');
  } catch (err) {
    // Log the full error so connection issues are immediately diagnosable.
    // Common causes: wrong DATABASE_URL, SSL not enabled, DB not reachable.
    console.error('[Migration] Failed to run migrations.');
    console.error('[Migration] Error code   :', err.code    || 'N/A');
    console.error('[Migration] Error message:', err.message || 'No message (check DATABASE_URL and SSL settings)');
    process.exit(1);
  }
};

// ---------------------------------------------------------------------------
// Bootstrap: run migrations then start the HTTP server.
// ---------------------------------------------------------------------------
const start = async () => {
  await runMigrations();

  app.listen(PORT, () => {
    console.log(`[Server] drivecore-billing-service running on port ${PORT}`);
    console.log(`[Server] Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Server] Auth Service: ${process.env.AUTH_SERVICE_URL || 'NOT SET'}`);
  });
};

start();
