'use strict';

const { validationResult } = require('express-validator');
const db = require('../config/db');
const { verifyUser } = require('../services/authService');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/bookings
// Create a new service booking.
// ─────────────────────────────────────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  // ── 1. Validate incoming request body ────────────────────────────────────
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { userId, vehicleNumber, date, serviceType } = req.body;

  try {
    // ── 2. Inter-service call: verify userId exists in Auth Service ─────────
    //
    //  The Booking Service owns no users table — user data lives in the Auth
    //  Service. Before inserting, we call:
    //    GET AUTH_SERVICE_URL/api/auth/users/:userId
    //  If the Auth Service returns 404 the user does not exist and we abort.
    //  If it is unreachable we return 503 Service Unavailable.
    //  All error shapes are handled inside authService.verifyUser().
    await verifyUser(userId);

    // ── 3. Persist the new booking using raw SQL via pg pool ─────────────────
    const { rows } = await db.query(
      `INSERT INTO bookings (user_id, vehicle_number, service_type, date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, vehicleNumber, serviceType, new Date(date)]
    );

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: rows[0],
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/:userId
// Retrieve all bookings belonging to a specific user.
// ─────────────────────────────────────────────────────────────────────────────
const getUserBookings = async (req, res, next) => {
  const { userId } = req.params;

  try {
    // ── Verify the user still exists before returning their data ─────────────
    //  Prevents leaking booking history for deleted accounts.
    await verifyUser(userId);

    const { rows } = await db.query(
      `SELECT * FROM bookings
       WHERE user_id = $1
       ORDER BY date ASC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getUserBookings };
