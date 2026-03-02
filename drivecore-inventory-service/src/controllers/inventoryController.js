const { validationResult } = require('express-validator');
const axios  = require('axios');
const pool   = require('../config/db');

// ---------------------------------------------------------------------------
// GET /api/inventory
// Returns all inventory items stored in the database.
// ---------------------------------------------------------------------------
const getAllInventory = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, user_id, item_name, quantity, price, created_at FROM inventory ORDER BY created_at DESC'
    );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    return next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/inventory
// Adds a new inventory item after verifying the userId with the Auth Service.
//
// Inter-Service Communication Flow:
//   1. Extract `userId` from the request body.
//   2. Call AUTH_SERVICE_URL/api/auth/users/:userId via axios GET.
//      - If the Auth Service returns 404 → reject with 404 "User not found".
//      - If the Auth Service is unreachable → reject with 503 "Auth Service unavailable".
//   3. Only on a successful user verification → insert the item into Postgres.
// ---------------------------------------------------------------------------
const addInventoryItem = async (req, res, next) => {
  // --- 1. Input validation (express-validator) ---
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { userId, itemName, quantity, price } = req.body;

  // --- 2. Inter-Service Communication: verify userId with Auth Service ---
  //
  // AUTH_SERVICE_URL is injected via environment variable so the service
  // remains portable across local Docker Compose and cloud environments.
  //
  // Example value:  AUTH_SERVICE_URL=http://drivecore-user-service:3001
  // The Auth Service exposes: GET /api/auth/users/:userId
  const authServiceUrl = process.env.AUTH_SERVICE_URL;

  if (!authServiceUrl) {
    // Fail loudly in development; prevents silent misconfiguration.
    return next(new Error('AUTH_SERVICE_URL environment variable is not set'));
  }

  try {
    // axios.get throws on any 4xx/5xx response status, which we catch below.
    await axios.get(`${authServiceUrl}/api/auth/users/${userId}`, {
      timeout: 5000, // 5-second timeout to prevent hanging requests
    });

    // If we reach here, the Auth Service confirmed the user exists.
    console.log(`[Inter-Service] User ${userId} verified via Auth Service.`);
  } catch (authErr) {
    // --- Handle known Auth Service error responses ---
    if (authErr.response) {
      const status = authErr.response.status;

      if (status === 404) {
        // Auth Service explicitly said the user does not exist.
        return res.status(404).json({
          success: false,
          message: `User with ID '${userId}' was not found. Cannot add inventory item.`,
        });
      }

      // Any other 4xx/5xx from Auth Service → surface as bad gateway
      console.error(
        `[Inter-Service] Auth Service returned ${status} for userId ${userId}.`
      );
      return res.status(502).json({
        success: false,
        message: 'Auth Service returned an unexpected error. Please try again.',
      });
    }

    // Network-level error (ECONNREFUSED, timeout, DNS failure, etc.)
    console.error(
      `[Inter-Service] Could not reach Auth Service at ${authServiceUrl}:`,
      authErr.message
    );
    return res.status(503).json({
      success: false,
      message: 'Auth Service is currently unavailable. Please try again later.',
    });
  }

  // --- 3. Persist the new inventory item using raw SQL ---
  try {
    const result = await pool.query(
      `INSERT INTO inventory (user_id, item_name, quantity, price)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, item_name, quantity, price, created_at`,
      [userId, itemName, quantity, price]
    );

    return res.status(201).json({
      success: true,
      message: 'Inventory item added successfully.',
      data: result.rows[0],
    });
  } catch (dbErr) {
    return next(dbErr);
  }
};

module.exports = { getAllInventory, addInventoryItem };
