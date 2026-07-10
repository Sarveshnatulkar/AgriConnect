/**
 * Centralized Error Handling Middleware
 *
 * Two middleware functions:
 * 1. notFound     — catches requests to undefined routes (404)
 * 2. errorHandler — formats and returns all errors consistently
 *
 * Why centralized? Avoids duplicating try/catch and res.status().json()
 * patterns across every controller. Any thrown error bubbles up here.
 */

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // If a response status was already set (e.g., 400, 403), use it.
  // Otherwise default to 500 (Internal Server Error).
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only expose the stack trace in development mode
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
