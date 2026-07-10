/**
 * authorize — Role-Based Access Control Middleware
 *
 * This is a higher-order function (a factory). It accepts a list of allowed
 * roles and returns the actual Express middleware function.
 *
 * Usage in a route file:
 *   const { protect } = require("../middlewares/authMiddleware");
 *   const { authorize } = require("../middlewares/roleMiddleware");
 *
 *   // Only farmers can access this route
 *   router.post("/crops", protect, authorize("farmer"), createCrop);
 *
 *   // Both admins and farmers can access this route
 *   router.get("/crops", protect, authorize("admin", "farmer"), getCrops);
 *
 * Why must `protect` always come before `authorize`?
 *   authorize reads req.user.role, which is only set by the protect middleware.
 *   If protect hasn't run, req.user is undefined and authorize will throw.
 *   Always chain them: protect → authorize → controller.
 *
 * @param  {...string} roles - Allowed role names
 * @returns Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Defensive check: protect should always run before authorize
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized — authentication required");
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied — this resource is restricted to: ${roles.join(", ")}`
      );
    }

    next();
  };
};

module.exports = { authorize };
