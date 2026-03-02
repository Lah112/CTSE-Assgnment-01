'use strict';

const axios = require('axios');
const env = require('../config/env');

/**
 * ── Inter-Service Communication: User Verification ─────────────────────────
 *
 * Before creating a booking, the Booking Service calls the Auth Service to
 * confirm that the supplied userId maps to a real, active user account.
 *
 * Flow:
 *   POST /api/bookings  →  authService.verifyUser(userId)
 *                               │
 *                               │  HTTP GET
 *                               ▼
 *              Auth Service: GET /api/auth/users/:userId
 *                               │
 *              200 OK  ─────────┤  (user exists → proceed)
 *              404 Not Found ───┘  (user not found → reject with 404)
 *
 * The AUTH_SERVICE_URL env var keeps this loosely coupled — in production it
 * points to the ECS task / load-balancer URL; in development it points to
 * localhost:3001 or a Docker network alias.
 */

// Dedicated axios instance for calls to the Auth Service.
// A 5-second timeout guards against a slow or unresponsive upstream.
const authClient = axios.create({
  baseURL: env.authServiceUrl,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Verify that a user with the given UUID exists in the Auth Service.
 *
 * @param  {string}  userId  - UUID of the user to verify.
 * @returns {Promise<object>} Resolved user payload from the Auth Service.
 * @throws  Will throw with { statusCode, message } on failure.
 */
const verifyUser = async (userId) => {
  try {
    // ── Call Auth Service user-verification endpoint ─────────────────────
    const response = await authClient.get(`/api/auth/users/${userId}`);

    // Auth Service must respond with { success: true, data: { id, name, email } }
    return response.data.data;

  } catch (err) {
    // ── Handle HTTP-level errors returned by the Auth Service ─────────────
    if (err.response) {
      const status = err.response.status;

      if (status === 404) {
        const notFound = new Error(`User with id '${userId}' does not exist.`);
        notFound.statusCode = 404;
        throw notFound;
      }

      // Auth Service returned some other 4xx/5xx
      const upstream = new Error(
        `Auth Service returned ${status}: ${err.response.data?.message || 'Unknown error'}`
      );
      upstream.statusCode = 502; // Bad Gateway — upstream responded with an error
      throw upstream;
    }

    // ── Handle network errors (timeout, DNS failure, ECONNREFUSED) ────────
    const networkErr = new Error(
      `Cannot reach Auth Service at ${env.authServiceUrl}. Is it running?`
    );
    networkErr.statusCode = 503; // Service Unavailable
    throw networkErr;
  }
};

module.exports = { verifyUser };
