const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");

/**
 * Root API router — mounted at /api/v1 in app.js
 *
 * All feature routers are registered here.
 * As phases are completed, add them below.
 *
 * Current:
 *   Phase 2: /auth
 *
 * Upcoming:
 *   Phase 3: /crops
 *   Phase 7: /orders
 *   Phase 8: /deliveries
 *   Phase 9: /messages
 */

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriConnect API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── Feature Routes ───────────────────────────────────────────────────────────
router.use("/auth", authRoutes);

module.exports = router;
