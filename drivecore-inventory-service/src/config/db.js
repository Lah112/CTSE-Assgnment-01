const { Pool } = require('pg');

/**
 * PostgreSQL connection pool.
 * Reads the full connection string from DATABASE_URL environment variable.
 * Using a Pool (not a single Client) for concurrency and automatic reconnection.
 *
 * Example DATABASE_URL:
 *   postgresql://user:password@localhost:5432/inventory_db
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // In production (e.g., cloud-managed Postgres), you may need SSL.
  // Uncomment the block below and set DB_SSL=true in your environment.
  // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,               // maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Emit a warning if the pool encounters a background error
// (e.g., lost connection) so it surfaces in logs without crashing.
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

module.exports = pool;
