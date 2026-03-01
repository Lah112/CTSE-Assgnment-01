'use strict';

const db = require('../config/db');

/**
 * Create the users table if it does not already exist.
 * Called once on application startup.
 */
const initTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(120)  NOT NULL,
      email       VARCHAR(254)  NOT NULL UNIQUE,
      password    TEXT          NOT NULL,
      role        VARCHAR(20)   NOT NULL DEFAULT 'customer',
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
  `;
  await db.query(sql);
};

/**
 * Find a user by their email address.
 * @param {string} email
 * @returns {Object|null} User row or null
 */
const findByEmail = async (email) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email.toLowerCase()]
  );
  return rows[0] || null;
};

/**
 * Find a user by their ID.
 * @param {string} id  UUID
 * @returns {Object|null} User row (without password) or null
 */
const findById = async (id) => {
  const { rows } = await db.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

/**
 * Insert a new user record.
 * @param {Object} param0  - { name, email, hashedPassword, role }
 * @returns {Object} Newly created user row (without password)
 */
const create = async ({ name, email, hashedPassword, role = 'customer' }) => {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email.toLowerCase(), hashedPassword, role]
  );
  return rows[0];
};

module.exports = { initTable, findByEmail, findById, create };
