const asyncHandler       = require("express-async-handler");
const Order              = require("../models/Order");
const Crop               = require("../models/Crop");
const TransportRequest   = require("../models/TransportRequest");

/**
 * Order Controller
 *
 * Endpoints:
 *   POST   /api/v1/orders              placeOrder        (buyer)
 *   GET    /api/v1/orders/my           getMyOrders       (buyer)
 *   GET    /api/v1/orders/received     getFarmerOrders   (farmer)
 *   PATCH  /api/v1/orders/:id/status   updateOrderStatus (farmer)
 *   DELETE /api/v1/orders/:id          cancelOrder       (buyer)
 *
 * Status transitions allowed:
 *   pending  → accepted  (farmer)
 *   pending  → rejected  (farmer)
 *   pending  → cancelled (buyer)
 *
 * Side effect on accept:
 *   A TransportRequest is automatically created and linked to the order.
 */

// ─── PLACE ORDER ──────────────────────────────────────────────────────────────
/**
 * @desc    Buyer places an order for a crop
 * @route   POST /api/v1/orders
 * @access  Private — Buyer
 */
const placeOrder = asyncHandler(async (req, res) => {
  const { cropId, orderedQuantity, deliveryAddress, buyerNote } = req.body;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!cropId) {
    res.status(400);
    throw new Error("cropId is required");
  }

  if (!orderedQuantity || isNaN(orderedQuantity) || Number(orderedQuantity) <= 0) {
    res.status(400);
    throw new Error("orderedQuantity must be a positive number");
  }

  // ── Fetch crop ────────────────────────────────────────────────────────────
  const crop = await Crop.findById(cropId).populate("owner", "name email phone");
  if (!crop) {
    res.status(404);
    throw new Error("Crop not found");
  }

  if (!crop.isAvailable) {
    res.status(400);
    throw new Error("This crop is no longer available");
  }

  // Buyer cannot order their own crop (edge case if they registered as buyer
  // and another user listed the crop — belt-and-suspenders check)
  if (crop.owner._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot order your own crop");
  }

  const qty    = Number(orderedQuantity);
  const total  = parseFloat((qty * crop.price).toFixed(2));

  // ── Create order ──────────────────────────────────────────────────────────
  const order = await Order.create({
    crop:             crop._id,
    buyer:            req.user._id,
    farmer:           crop.owner._id,
    cropName:         crop.cropName,
    orderedQuantity:  qty,
    unit:             crop.unit,
    priceAtOrder:     crop.price,
    totalAmount:      total,
    status:           "pending",
    deliveryAddress:  deliveryAddress || {},
    buyerNote:        buyerNote?.trim() || "",
  });

  // Populate for response
  await order.populate([
    { path: "crop",   select: "cropName category images location" },
    { path: "buyer",  select: "name email phone" },
    { path: "farmer", select: "name email phone" },
  ]);

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: { order },
  });
});

// ─── GET MY ORDERS (buyer) ────────────────────────────────────────────────────
/**
 * @desc    Get all orders placed by the authenticated buyer
 * @route   GET /api/v1/orders/my
 * @access  Private — Buyer
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate("crop",   "cropName category images location")
    .populate("farmer", "name email phone")
    .populate("transportRequest", "status transporter")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count:   orders.length,
    data:    { orders },
  });
});

// ─── GET RECEIVED ORDERS (farmer) ─────────────────────────────────────────────
/**
 * @desc    Get all orders received by the authenticated farmer
 * @route   GET /api/v1/orders/received
 * @access  Private — Farmer
 */
const getFarmerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ farmer: req.user._id })
    .populate("crop",   "cropName category images location")
    .populate("buyer",  "name email phone")
    .populate("transportRequest", "status transporter")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count:   orders.length,
    data:    { orders },
  });
});

// ─── UPDATE ORDER STATUS (farmer accepts / rejects) ────────────────────────────
/**
 * @desc    Farmer accepts or rejects a pending order
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Private — Farmer (owner of the crop)
 *
 * On accept:
 *   1. Order status → "accepted"
 *   2. TransportRequest created with status "open"
 *   3. order.transportRequest set to the new TR's _id
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, farmerNote } = req.body;

  const ALLOWED_TRANSITIONS = ["accepted", "rejected"];
  if (!ALLOWED_TRANSITIONS.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${ALLOWED_TRANSITIONS.join(", ")}`);
  }

  const order = await Order.findById(req.params.id)
    .populate("crop", "cropName location unit");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Only the farmer who owns this order can update it
  if (order.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized — this is not your order");
  }

  if (order.status !== "pending") {
    res.status(400);
    throw new Error(`Cannot change status — order is already "${order.status}"`);
  }

  order.status     = status;
  order.farmerNote = farmerNote?.trim() || "";

  // ── Auto-create transport request on accept ────────────────────────────
  if (status === "accepted") {
    const tr = await TransportRequest.create({
      order:    order._id,
      farmer:   order.farmer,
      buyer:    order.buyer,
      cropName: order.cropName,
      quantity: order.orderedQuantity,
      unit:     order.unit,
      pickupAddress: {
        state:    order.crop?.location?.state    || "",
        district: order.crop?.location?.district || "",
        village:  order.crop?.location?.village  || "",
      },
      dropoffAddress: order.deliveryAddress || {},
      status:   "open",
    });
    order.transportRequest = tr._id;
  }

  await order.save();

  // Populate full response
  await order.populate([
    { path: "crop",             select: "cropName category images location" },
    { path: "buyer",            select: "name email phone" },
    { path: "farmer",           select: "name email phone" },
    { path: "transportRequest", select: "status transporter" },
  ]);

  res.status(200).json({
    success: true,
    message: `Order ${status} successfully`,
    data:    { order },
  });
});

// ─── CANCEL ORDER (buyer) ─────────────────────────────────────────────────────
/**
 * @desc    Buyer cancels a pending order
 * @route   DELETE /api/v1/orders/:id
 * @access  Private — Buyer
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized — this is not your order");
  }

  if (order.status !== "pending") {
    res.status(400);
    throw new Error(`Cannot cancel — order is already "${order.status}"`);
  }

  order.status = "cancelled";
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    data:    { order },
  });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  cancelOrder,
};
