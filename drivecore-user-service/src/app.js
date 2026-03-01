'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security Middleware ────────────────────────────────────────────────────

// Sets secure HTTP response headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);

// ── Body Parsers ───────────────────────────────────────────────────────────

// Limit payload size to prevent large-body DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Health Check ───────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'drivecore-user-service',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);

// ── Error Handling ─────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
