'use strict';

const app = require('./app');
const env = require('./config/env');
const { pool } = require('./config/db');
const userModel = require('./models/userModel');

const start = async () => {
  try {
    // Verify database connectivity
    await pool.query('SELECT 1');
    console.log('[DB] Connected to PostgreSQL successfully.');

    // Run schema migrations / table init
    await userModel.initTable();
    console.log('[DB] Schema initialised.');

    const server = app.listen(env.port, () => {
      console.log(
        `[SERVER] DriveCore User Service running on port ${env.port} in ${process.env.NODE_ENV || 'development'} mode.`
      );
    });

    // ── Graceful Shutdown ──────────────────────────────────────────────────

    const shutdown = async (signal) => {
      console.log(`\n[SERVER] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await pool.end();
        console.log('[DB] Connection pool closed.');
        console.log('[SERVER] Shutdown complete.');
        process.exit(0);
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        console.error('[SERVER] Forced shutdown after timeout.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('[SERVER] Failed to start:', err.message);
    process.exit(1);
  }
};

start();
