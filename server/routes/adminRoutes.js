const express = require("express");
const router  = express.Router();

const {
  getStats,
  getUsers, getUserById, toggleUserStatus, deleteUser,
  getAllCropsAdmin, toggleCropAvailability, deleteCropAdmin,
  getAllOrdersAdmin,
  getAllTransportAdmin, completeTransport,
} = require("../controllers/adminController");

const { protect }   = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// Every admin route requires authentication AND the admin role
const adminGuard = [protect, authorize("admin")];

/**
 * Admin Routes — mounted at /api/v1/admin in routes/index.js
 *
 * Stats:
 *   GET    /api/v1/admin/stats
 *
 * Users:
 *   GET    /api/v1/admin/users
 *   GET    /api/v1/admin/users/:id
 *   PATCH  /api/v1/admin/users/:id/toggle
 *   DELETE /api/v1/admin/users/:id
 *
 * Crops:
 *   GET    /api/v1/admin/crops
 *   PATCH  /api/v1/admin/crops/:id/toggle
 *   DELETE /api/v1/admin/crops/:id
 *
 * Orders:
 *   GET    /api/v1/admin/orders
 *
 * Transport:
 *   GET    /api/v1/admin/transport
 *   PATCH  /api/v1/admin/transport/:id/complete
 */

// Stats
router.get("/stats", adminGuard, getStats);

// Users — static routes before /:id
router.get(   "/users",           adminGuard, getUsers);
router.get(   "/users/:id",       adminGuard, getUserById);
router.patch( "/users/:id/toggle",adminGuard, toggleUserStatus);
router.delete("/users/:id",       adminGuard, deleteUser);

// Crops
router.get(   "/crops",             adminGuard, getAllCropsAdmin);
router.patch( "/crops/:id/toggle",  adminGuard, toggleCropAvailability);
router.delete("/crops/:id",         adminGuard, deleteCropAdmin);

// Orders
router.get("/orders", adminGuard, getAllOrdersAdmin);

// Transport
router.get(   "/transport",              adminGuard, getAllTransportAdmin);
router.patch( "/transport/:id/complete", adminGuard, completeTransport);

module.exports = router;
