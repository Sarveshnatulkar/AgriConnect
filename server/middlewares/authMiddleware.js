const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

/**
 * protect — JWT Authentication Middleware
 *
 * Flow:
 *  1. Read the `jwt` cookie from the request (set during login/register)
 *  2. If no cookie → 401 Unauthorized
 *  3. Verify the token signature and expiry using JWT_SECRET
 *  4. If token is invalid or expired → 401 Unauthorized
 *  5. Find the user in DB by the id encoded in the token
 *  6. If user doesn't exist (deleted) → 401 Unauthorized
 *  7. If user is deactivated → 403 Forbidden
 *  8. Attach user to req.user and call next()
 *
 * Why fetch from DB on every request?
 *  JWTs are stateless. Without a DB check, a token belonging to a
 *  deleted or deactivated user would still be valid until expiry.
 *  Fetching the user catches these cases. The query is lightweight
 *  (indexed _id lookup) and is cached naturally by MongoDB's WiredTiger.
 *
 * Why use asyncHandler?
 *  It wraps the async function so any thrown error flows to errorMiddleware
 *  instead of causing an unhandled promise rejection.
 */
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized — no token provided");
  }

  // Verify the token. jwt.verify throws if invalid or expired.
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    // Distinguish between expired and malformed tokens for clearer errors
    if (err.name === "TokenExpiredError") {
      throw new Error("Session expired — please log in again");
    }
    throw new Error("Not authorized — invalid token");
  }

  // Fetch fresh user data from DB (excludes password by default via schema)
  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error("Not authorized — user no longer exists");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Account deactivated — please contact support");
  }

  // Attach the full user document to the request object.
  // Downstream middleware and controllers access it via req.user
  req.user = user;
  next();
});

module.exports = { protect };
