const express = require("express");
const router = express.Router();

const authRoutes      = require("./authRoutes");
const cropRoutes      = require("./cropRoutes");
const orderRoutes     = require("./orderRoutes");
const transportRoutes = require("./transportRoutes");
const adminRoutes     = require("./adminRoutes");

/**
 * Root API router — mounted at /api/v1 in app.js
 *
 * Phase 2: /auth
 * Phase 3: /crops
 * Phase 7: /orders
 * Phase 8: /transport
 * Phase 14: /admin
 */

router.get("/health", (req, res) => {
  res.status(200).json({
    success:     true,
    message:     "AgriConnect API is running",
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

router.use("/auth",      authRoutes);
router.use("/crops",     cropRoutes);
router.use("/orders",    orderRoutes);
router.use("/transport", transportRoutes);
router.use("/admin",     adminRoutes);

module.exports = router;
