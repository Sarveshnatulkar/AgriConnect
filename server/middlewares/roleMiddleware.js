/**
 * Role-Based Access Control Middleware (Placeholder — implemented in Phase 2)
 *
 * Usage (after it's implemented):
 *   router.get('/admin/users', protect, authorize('admin'), getUsers)
 *
 * It will:
 *  - Accept one or more allowed roles as arguments
 *  - Check req.user.role (set by authMiddleware)
 *  - Call next() if the role matches, otherwise throw 403 Forbidden
 */

const authorize = (...roles) => {
  return (req, res, next) => {
    // TODO: implement in Phase 2
    next();
  };
};

module.exports = { authorize };
