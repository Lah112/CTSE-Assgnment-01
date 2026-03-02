'use strict';

const app = require('./app');
const env = require('./config/env');
const { pool, initTable } = require('./config/db');

const start = async () => {
  try {
    // ── Verify database connectivity ─────────────────────────────────────────
    await pool.query('SELECT 1');
    console.log('[DB] Connected to PostgreSQL successfully.');

    // ── Run auto-migration: create bookings table if it does not exist ────────
    await initTable();
    console.log('[DB] Schema initialised.');

    const server = app.listen(env.port, () => {
      console.log(
        `[SERVER] DriveCore Booking Service running on port ${env.port} in ${env.nodeEnv} mode.`
      );
      console.log(`[SERVER] Auth Service URL → ${env.authServiceUrl}`);
    });

    // ── Graceful Shutdown ─────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n[SERVER] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await pool.end();
        console.log('[DB] Connection pool closed.');
        console.log('[SERVER] Shutdown complete.');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('[SERVER] Forced shutdown after timeout.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('[SERVER] Failed to start:', err.message);
    await pool.end();
    process.exit(1);
  }
};

start();
