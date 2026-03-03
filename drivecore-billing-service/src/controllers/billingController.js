const { validationResult } = require('express-validator');
const axios = require('axios');
const pool  = require('../config/db');

// ---------------------------------------------------------------------------
// POST /api/billing
// Creates a new invoice after verifying the userId with the Auth Service.
//
// Inter-Service Communication Flow:
//   1. Validate incoming request body fields.
//   2. Read AUTH_SERVICE_URL from environment and call:
//        GET {AUTH_SERVICE_URL}/api/auth/users/:userId
//      - 404 from Auth Service → reject with 404 "User not found".
//      - Other 4xx/5xx         → reject with 502 "Auth Service error".
//      - Network failure        → reject with 503 "Auth Service unavailable".
//   3. On successful verification → INSERT the invoice row into Postgres.
// ---------------------------------------------------------------------------
const createInvoice = async (req, res, next) => {
  // --- 1. Input validation ---
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { userId, bookingId, amount, status } = req.body;

  // --- 2. Inter-Service Communication: verify userId with the Auth Service ---
  //
  // AUTH_SERVICE_URL is injected via environment variable so this service
  // remains portable across local dev, Docker Compose, and cloud deployments.
  //
  // Accepted values:
  //   Local dev    → http://localhost:3001
  //   Docker:      → http://drivecore-user-service:3001
  //
  // The Auth Service endpoint being called:
  //   GET /api/auth/users/:userId
  //   Returns user data (without password) when the user exists; 404 otherwise.
  const authServiceUrl = process.env.AUTH_SERVICE_URL;

  if (!authServiceUrl) {
    // Fail loudly rather than silently skipping verification.
    return next(new Error('AUTH_SERVICE_URL environment variable is not set'));
  }

  try {
    // axios.get will throw on any non-2xx HTTP status, handled in catch below.
    await axios.get(`${authServiceUrl}/api/auth/users/${userId}`, {
      timeout: 5000, // 5-second hard timeout — prevents slow Auth Service from blocking
    });

    // Reaching here confirms the Auth Service returned a 2xx: user is valid.
    console.log(`[Inter-Service] User ${userId} verified via Auth Service.`);
  } catch (authErr) {
    if (authErr.response) {
      // The Auth Service responded but with an error status code.
      const status = authErr.response.status;

      if (status === 404) {
        // Auth Service explicitly confirmed this user does not exist.
        return res.status(404).json({
          success: false,
          message: `User with ID '${userId}' was not found. Cannot create invoice.`,
        });
      }

      // Any other 4xx/5xx from Auth Service surfaces as a bad-gateway error.
      console.error(
        `[Inter-Service] Auth Service returned HTTP ${status} for userId ${userId}.`
      );
      return res.status(502).json({
        success: false,
        message: 'Auth Service returned an unexpected error. Please try again.',
      });
    }

    // Network-level failure: ECONNREFUSED, DNS error, timeout, etc.
    console.error(
      `[Inter-Service] Could not reach Auth Service at ${authServiceUrl}:`,
      authErr.message
    );
    return res.status(503).json({
      success: false,
      message: 'Auth Service is currently unavailable. Please try again later.',
    });
  }

  // --- 3. Persist the invoice using raw SQL (no ORM) ---
  try {
    const result = await pool.query(
      `INSERT INTO billing (user_id, booking_id, amount, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, booking_id, amount, status, created_at`,
      [userId, bookingId, amount, status]
    );

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully.',
      data: result.rows[0],
    });
  } catch (dbErr) {
    return next(dbErr);
  }
};

// ---------------------------------------------------------------------------
// GET /api/billing/:userId
// Retrieves all invoices belonging to a specific user.
// ---------------------------------------------------------------------------
const getInvoicesByUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, user_id, booking_id, amount, status, created_at
       FROM billing
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Return an empty array (not 404) when the user has no invoices yet —
    // an empty result is a valid state, not an error.
    return res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createInvoice, getInvoicesByUser };
