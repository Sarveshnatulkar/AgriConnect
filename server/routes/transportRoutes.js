const express = require("express");
const router  = express.Router();

const {
  getAvailableRequests,
  getMyAssignments,
  acceptRequest,
} = require("../controllers/transportController");

const { protect }   = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

/**
 * Transport Routes — mounted at /api/v1/transport in routes/index.js
 *
 * GET   /api/v1/transport            getAvailableRequests (transporter)
 * GET   /api/v1/transport/my         getMyAssignments     (transporter)
 * PATCH /api/v1/transport/:id/accept acceptRequest        (transporter)
 *
 * Route ordering: /my MUST come before /:id/accept
 */

router.get(   "/",          protect, authorize("transporter"), getAvailableRequests);
router.get(   "/my",        protect, authorize("transporter"), getMyAssignments);
router.patch( "/:id/accept",protect, authorize("transporter"), acceptRequest);

module.exports = router;
