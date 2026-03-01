'use strict';

require('dotenv').config();

// Support either a full DATABASE_URL (Neon, Railway, Supabase, etc.)
// or individual DB_* variables for self-hosted setups.
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const hasIndividualVars =
  process.env.DB_HOST &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_NAME;

if (!hasDatabaseUrl && !hasIndividualVars) {
  throw new Error(
    'Database configuration missing. Set DATABASE_URL or DB_HOST / DB_USER / DB_PASSWORD / DB_NAME.'
  );
}

const required = ['JWT_SECRET', 'JWT_EXPIRES_IN'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3001,
  db: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  isProduction: process.env.NODE_ENV === 'production',
};
