const asyncHandler     = require("express-async-handler");
const TransportRequest = require("../models/TransportRequest");
const Order            = require("../models/Order");

/**
 * Transport Controller
 *
 * Endpoints:
 *   GET   /api/v1/transport          getAvailableRequests  (transporter)
 *   GET   /api/v1/transport/my       getMyAssignments      (transporter)
 *   PATCH /api/v1/transport/:id/accept  acceptRequest      (transporter)
 */

// ─── GET AVAILABLE REQUESTS ───────────────────────────────────────────────────
/**
 * @desc    Get all open transport requests (not yet assigned)
 * @route   GET /api/v1/transport
 * @access  Private — Transporter
 */
const getAvailableRequests = asyncHandler(async (req, res) => {
  const requests = await TransportRequest.find({ status: "open" })
    .populate("farmer", "name phone")
    .populate("buyer",  "name phone")
    .populate("order",  "totalAmount status createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count:   requests.length,
    data:    { requests },
  });
});

// ─── GET MY ASSIGNMENTS ───────────────────────────────────────────────────────
/**
 * @desc    Get all transport requests assigned to the authenticated transporter
 * @route   GET /api/v1/transport/my
 * @access  Private — Transporter
 */
const getMyAssignments = asyncHandler(async (req, res) => {
  const requests = await TransportRequest.find({ transporter: req.user._id })
    .populate("farmer", "name phone email")
    .populate("buyer",  "name phone email")
    .populate("order",  "totalAmount status createdAt orderedQuantity unit")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count:   requests.length,
    data:    { requests },
  });
});

// ─── ACCEPT TRANSPORT REQUEST ─────────────────────────────────────────────────
/**
 * @desc    Transporter accepts an open transport request
 * @route   PATCH /api/v1/transport/:id/accept
 * @access  Private — Transporter
 *
 * Side effects:
 *   1. TransportRequest status → "assigned"
 *   2. TransportRequest.transporter → req.user._id
 *   3. Linked Order status → "assigned"
 */
const acceptRequest = asyncHandler(async (req, res) => {
  const tr = await TransportRequest.findById(req.params.id);

  if (!tr) {
    res.status(404);
    throw new Error("Transport request not found");
  }

  if (tr.status !== "open") {
    res.status(400);
    throw new Error(`This request is already "${tr.status}" — it is no longer available`);
  }

  // ── Assign to this transporter ────────────────────────────────────────
  tr.status      = "assigned";
  tr.transporter = req.user._id;
  await tr.save();

  // ── Update the linked order to "assigned" ─────────────────────────────
  await Order.findByIdAndUpdate(tr.order, { status: "assigned" });

  await tr.populate([
    { path: "farmer",      select: "name phone email" },
    { path: "buyer",       select: "name phone email" },
    { path: "transporter", select: "name phone email" },
    { path: "order",       select: "totalAmount status cropName orderedQuantity unit" },
  ]);

  res.status(200).json({
    success: true,
    message: "Transport request accepted — you are now assigned to this delivery",
    data:    { request: tr },
  });
});

module.exports = {
  getAvailableRequests,
  getMyAssignments,
  acceptRequest,
};
