'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const bookingRoutes = require('./routes/bookingRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: env.cors.origin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing (10 kb limit to guard against large-body attacks) ────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.status(200).json({
    success: true,
    service: 'drivecore-booking-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
);

// ── Booking routes ────────────────────────────────────────────────────────────
app.use('/api/bookings', bookingRoutes);

// ── 404 & global error handler — MUST be last ─────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
