const express = require("express");
const router = express.Router();

const {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getFeaturedCrops,
  getMyCrops,
} = require("../controllers/cropController");

const { protect }   = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

/**
 * Crop Routes — mounted at /api/v1/crops in routes/index.js
 *
 *  GET    /api/v1/crops/featured → getFeaturedCrops (public)
 *  GET    /api/v1/crops/my       → getMyCrops       (farmer only — all own crops, no availability filter)
 *  GET    /api/v1/crops          → getAllCrops       (any authenticated user)
 *  POST   /api/v1/crops          → createCrop        (farmer only)
 *  GET    /api/v1/crops/:id      → getCropById       (any authenticated user)
 *  PUT    /api/v1/crops/:id      → updateCrop        (owner or admin)
 *  DELETE /api/v1/crops/:id      → deleteCrop        (owner or admin)
 *
 * IMPORTANT: /featured and /my must be declared BEFORE /:id so Express
 * does not interpret those literal strings as MongoDB ObjectId params.
 */

// ── Public route — no auth ────────────────────────────────────────────────────
router.get("/featured", getFeaturedCrops);

// ── Farmer's own listings — all crops regardless of availability ──────────────
router.get("/my", protect, authorize("farmer"), getMyCrops);

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
