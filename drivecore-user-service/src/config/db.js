'use strict';

const { Pool } = require('pg');
const env = require('./env');

// Build pool config — prefer DATABASE_URL (Neon / cloud providers)
// and fall back to individual host/user/password vars for self-hosted setups.
const poolConfig = env.db.connectionString
  ? {
      connectionString: env.db.connectionString,
      ssl: { rejectUnauthorized: false }, // required for Neon TLS
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[DB] Unexpected client error:', err.message);
  process.exit(-1);
});

/**
 * Execute a single parameterised query.
 * @param {string} text   - SQL query string
 * @param {Array}  params - Query parameters
 */
const query = (text, params) => pool.query(text, params);

/**
 * Run multiple queries inside a single transaction.
 * Automatically rolls back on error.
 * @param {Function} fn - async function that receives a connected client
 */
const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { query, withTransaction, pool };
