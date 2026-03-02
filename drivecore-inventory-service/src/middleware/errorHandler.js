/**
 * Centralised error-handling middleware.
 * Must be registered LAST in Express (after all routes).
 *
 * Express identifies this as an error handler because it accepts
 * four parameters (err, req, res, next).
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'Internal Server Error';

  // Avoid leaking stack traces in production
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };

  console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
