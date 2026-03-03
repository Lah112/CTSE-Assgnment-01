const { Pool } = require('pg');

/**
 * PostgreSQL connection pool.
 * Reads the full connection string from the DATABASE_URL environment variable.
 *
 * Using a Pool (not a single Client) provides:
 *  - Automatic connection reuse across concurrent requests
 *  - Built-in reconnection on transient failures
 *  - Configurable concurrency limits
 *
 * Example DATABASE_URL:
 *   postgresql://user:password@localhost:5432/billing_db
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // rejectUnauthorized: false is required for cloud-managed Postgres providers
  // (Neon, Supabase, AWS RDS, Render) that use self-signed or intermediate
  // TLS certificates. Without this the pg driver throws
  // "Connection terminated due to connection timeout" or a TLS handshake error.
  ssl: { rejectUnauthorized: false },
  max: 10,                      // maximum pool size
  idleTimeoutMillis: 30000,     // close idle clients after 30 s
  connectionTimeoutMillis: 5000, // 5 s — enough headroom for cloud DB cold starts
});

// Surface background pool errors in the logs without crashing the process.
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

module.exports = pool;
