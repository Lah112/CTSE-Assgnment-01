'use strict';

const { Pool } = require('pg');

// pg reads DATABASE_URL directly when connectionString is supplied.
// ssl: { rejectUnauthorized: false } is required for Neon / hosted PG over TLS.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool client error:', err.message);
  process.exit(-1);
});

/**
 * Execute a single parameterised query.
 * @param {string} text   - SQL string
 * @param {Array}  params - Bound parameters
 */
const query = (text, params) => pool.query(text, params);

/**
 * Create the bookings table if it does not already exist.
 * Called once during server startup before accepting traffic.
 */
const initTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id             SERIAL       PRIMARY KEY,
      user_id        VARCHAR(255) NOT NULL,
      vehicle_number VARCHAR(255) NOT NULL,
      service_type   VARCHAR(255) NOT NULL,
      date           TIMESTAMP    NOT NULL,
      created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
  `);
};

module.exports = { query, pool, initTable };
