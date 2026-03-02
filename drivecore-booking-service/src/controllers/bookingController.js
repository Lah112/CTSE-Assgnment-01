'use strict';

const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { verifyUser } = require('../services/authService');

// Single shared Prisma client instance
const prisma = new PrismaClient();

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

  const { userId, vehicleNumber, date, serviceType, notes } = req.body;

  try {
    // ── 2. Inter-service call: verify userId exists in Auth Service ─────────
    //
    //  The Booking Service has no local users table — user data is owned by
    //  the Auth Service. We call GET /api/auth/users/:userId before writing
    //  to our own database so we never create an orphaned booking for a
    //  non-existent user.
    //
    //  If the Auth Service returns 404 or is unreachable, authService.verifyUser
    //  throws a structured error that our errorHandler middleware will catch.
    await verifyUser(userId);

    // ── 3. Persist the new booking via Prisma ────────────────────────────────
    const booking = await prisma.booking.create({
      data: {
        userId,
        vehicleNumber,
        date: new Date(date),  // Ensure stored as UTC DateTime
        serviceType,
        notes: notes || null,
        // status defaults to PENDING (defined in schema)
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: booking,
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
    // ── Optional: verify the user still exists before fetching ───────────────
    //  This prevents returning booking history for a deleted account.
    await verifyUser(userId);

    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { date: 'asc' },  // Nearest upcoming first
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getUserBookings };
