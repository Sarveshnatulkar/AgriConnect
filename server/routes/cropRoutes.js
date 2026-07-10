const express = require("express");
const router = express.Router();

const {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
} = require("../controllers/cropController");

const { protect }   = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

/**
 * Crop Routes — mounted at /api/v1/crops in routes/index.js
 *
 * Middleware chain explanation:
 *
 *  protect              → verifies JWT cookie, attaches req.user
 *  authorize("farmer")  → checks req.user.role === "farmer"
 *
 * Route summary:
 *
 *  GET    /api/v1/crops         → getAllCrops   (any authenticated user)
 *  POST   /api/v1/crops         → createCrop   (farmer only)
 *  GET    /api/v1/crops/:id     → getCropById  (any authenticated user)
 *  PUT    /api/v1/crops/:id     → updateCrop   (owner or admin — checked in controller)
 *  DELETE /api/v1/crops/:id     → deleteCrop   (owner or admin — checked in controller)
 *
 * Why is updateCrop/deleteCrop not guarded by authorize("farmer") here?
 *   Because admins also need access. The ownership check happens inside the
 *   controller after fetching the document — that's the only place where we
 *   know both the requester's role AND the crop's owner ID.
 */

// ── Collection routes ──────────────────────────────────────────────────────────
router
  .route("/")
  .get(protect, getAllCrops)
  .post(protect, authorize("farmer"), createCrop);

// ── Resource routes ────────────────────────────────────────────────────────────
router
  .route("/:id")
  .get(protect, getCropById)
  .put(protect, updateCrop)
  .delete(protect, deleteCrop);

module.exports = router;
