require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const pool         = require('./config/db');
const inventoryRoutes = require('./routes/inventoryRoutes');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3003;

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

// helmet sets a suite of secure HTTP response headers (CSP, X-Frame-Options,
// HSTS, etc.) to harden the service against common web vulnerabilities.
app.use(helmet());

// cors restricts which origins can call this service.
// In production, replace the origin with your actual frontend/gateway domain.
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---------------------------------------------------------------------------
// Body Parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10kb' }));   // limit payload size to prevent abuse
app.use(express.urlencoded({ extended: false }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/inventory', inventoryRoutes);

// Health check — used by Docker/Kubernetes probes and load balancers
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'drivecore-inventory-service' });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central error handler — MUST be last middleware registered
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Auto-Migration: Ensure the inventory table exists on startup.
// Uses raw SQL with CREATE TABLE IF NOT EXISTS so it is idempotent and safe
// to run on every container restart without Prisma or any ORM dependency.
// ---------------------------------------------------------------------------
const runMigrations = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS inventory (
      id         SERIAL PRIMARY KEY,
      user_id    VARCHAR(255)   NOT NULL,
      item_name  VARCHAR(255)   NOT NULL,
      quantity   INT            NOT NULL DEFAULT 0,
      price      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableSQL);
    console.log('[Migration] inventory table is ready.');
  } catch (err) {
    console.error('[Migration] Failed to run migrations:', err.message);
    // Exit the process so the container restarts and retries (e.g., in Compose
    // when the DB container hasn't finished initialising yet).
    process.exit(1);
  }
};

// ---------------------------------------------------------------------------
// Bootstrap: run migrations then start listening for HTTP requests.
// ---------------------------------------------------------------------------
const start = async () => {
  await runMigrations();

  app.listen(PORT, () => {
    console.log(`[Server] drivecore-inventory-service running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Server] Auth Service URL: ${process.env.AUTH_SERVICE_URL || 'NOT SET'}`);
  });
};

start();
