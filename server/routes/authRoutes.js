const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");

/**
 * Auth Routes — mounted at /api/v1/auth in routes/index.js
 *
 * Public routes (no token required):
 *   POST /api/v1/auth/register   → create account + receive JWT cookie
 *   POST /api/v1/auth/login      → verify credentials + receive JWT cookie
 *
 * Private routes (JWT cookie required):
 *   POST /api/v1/auth/logout     → clear JWT cookie
 *   GET  /api/v1/auth/me         → get current user profile
 */

router.post("/register", register);
router.post("/login",    login);
router.post("/logout",   protect, logout);
router.get("/me",        protect, getMe);

module.exports = router;
