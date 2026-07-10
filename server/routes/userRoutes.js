const express = require("express");
const router  = express.Router();

const { updateProfile, changePassword } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

/**
 * User Routes — mounted at /api/v1/users in routes/index.js
 *
 * PUT   /api/v1/users/profile  — update name, phone, address, avatar
 * PATCH /api/v1/users/password — change password (requires currentPassword)
 */
router.put(   "/profile",  protect, updateProfile);
router.patch( "/password", protect, changePassword);

module.exports = router;
