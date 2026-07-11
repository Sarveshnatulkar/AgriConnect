const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT and sets it as an HTTP-only cookie on the response.
 *
 * Why HTTP-only cookie instead of localStorage?
 * - localStorage is accessible via JavaScript → vulnerable to XSS attacks.
 * - HTTP-only cookies are NOT accessible via JS → much more secure.
 * - The `secure` flag ensures the cookie is only sent over HTTPS in production.
 * - The `sameSite: strict` flag prevents CSRF attacks.
 *
 * @param {Object} res    - Express response object
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

module.exports = generateToken;
