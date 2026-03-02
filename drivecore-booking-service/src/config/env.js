'use strict';

require('dotenv').config();

// ── Helper: throw on missing required vars ─────────────────────────────────
const required = (name) => {
  const val = process.env[name];
  if (!val || val.trim() === '') {
    throw new Error(`[ENV] Missing required environment variable: ${name}`);
  }
  return val.trim();
};

const optional = (name, fallback) =>
  process.env[name]?.trim() || fallback;

// ── Validated environment config ──────────────────────────────────────────
module.exports = {
  port: parseInt(optional('PORT', '3002'), 10),
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: optional('NODE_ENV', 'development') === 'production',

  // DATABASE_URL is consumed directly by Prisma via prisma/schema.prisma
  // No need to parse it here — Prisma reads it from process.env.DATABASE_URL

  // URL of the User & Auth microservice for inter-service verification calls
  authServiceUrl: required('AUTH_SERVICE_URL'),

  cors: {
    origin: optional('CORS_ORIGIN', 'http://localhost:3000'),
  },
};
