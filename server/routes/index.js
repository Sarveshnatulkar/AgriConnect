const express = require("express");
const router = express.Router();

const authRoutes      = require("./authRoutes");
const cropRoutes      = require("./cropRoutes");
const orderRoutes     = require("./orderRoutes");
const transportRoutes = require("./transportRoutes");
const adminRoutes     = require("./adminRoutes");
const userRoutes      = require("./userRoutes");

const { getPlatformStats } = require("../controllers/cropController");

/**
 * Root API router — mounted at /api/v1 in app.js
 */

router.get("/health", (_req, res) => {
  res.status(200).json({
    success:     true,
    message:     "AgriConnect API is running",
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

// Public — live platform statistics for the homepage
router.get("/stats", getPlatformStats);

router.use("/auth",      authRoutes);
router.use("/crops",     cropRoutes);
router.use("/orders",    orderRoutes);
router.use("/transport", transportRoutes);
router.use("/admin",     adminRoutes);
router.use("/users",     userRoutes);

module.exports = router;
