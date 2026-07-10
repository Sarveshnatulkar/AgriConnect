/**
 * Auth Middleware (Placeholder — fully implemented in Phase 2)
 *
 * This file is created now so the import chain is never broken.
 * In Phase 2 we will:
 *  - Extract the JWT from the HTTP-only cookie
 *  - Verify it using JWT_SECRET
 *  - Attach the decoded user to req.user
 *  - Call next() or throw a 401 error
 */

const protect = (req, res, next) => {
  // TODO: implement in Phase 2
  next();
};

module.exports = { protect };
