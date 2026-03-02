'use strict';

const app = require('./app');
const env = require('./config/env');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const start = async () => {
  try {
    // ── Verify Prisma / database connectivity ────────────────────────────────
    await prisma.$connect();
    console.log('[DB] Prisma connected to PostgreSQL successfully.');

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
        await prisma.$disconnect();
        console.log('[DB] Prisma disconnected.');
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
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
