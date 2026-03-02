'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const { createBooking, getUserBookings } = require('../controllers/bookingController');

const router = Router();

// ── Valid service types (must mirror the Prisma ServiceType enum) ─────────────
const VALID_SERVICE_TYPES = [
  'OIL_CHANGE',
  'TIRE_ROTATION',
  'BRAKE_SERVICE',
  'GENERAL_INSPECTION',
  'ENGINE_REPAIR',
  'TRANSMISSION_SERVICE',
  'AC_SERVICE',
  'WHEEL_ALIGNMENT',
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/bookings
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('userId')
      .isUUID()
      .withMessage('userId must be a valid UUID.'),

    body('vehicleNumber')
      .trim()
      .notEmpty()
      .withMessage('vehicleNumber is required.')
      .isLength({ max: 20 })
      .withMessage('vehicleNumber must be 20 characters or fewer.'),

    body('date')
      .isISO8601()
      .withMessage('date must be a valid ISO 8601 date-time string (e.g. 2025-08-01T10:00:00Z).')
      .custom((val) => {
        if (new Date(val) <= new Date()) {
          throw new Error('Booking date must be in the future.');
        }
        return true;
      }),

    body('serviceType')
      .isIn(VALID_SERVICE_TYPES)
      .withMessage(`serviceType must be one of: ${VALID_SERVICE_TYPES.join(', ')}.`),

    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('notes must be 500 characters or fewer.'),
  ],
  createBooking
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/:userId
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/:userId',
  [
    param('userId')
      .isUUID()
      .withMessage('userId path parameter must be a valid UUID.'),
  ],
  getUserBookings
);

module.exports = router;
