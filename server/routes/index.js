const express = require("express");
const router = express.Router();

/**
 * Root API router.
 * All feature routers will be mounted here as phases are completed.
 *
 * Example (Phase 2):
 *   const authRoutes = require("./authRoutes");
 *   router.use("/auth", authRoutes);
 */

// Health check — confirms API is live
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriConnect API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
