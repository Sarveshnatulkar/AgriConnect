const asyncHandler     = require("express-async-handler");
const User             = require("../models/User");
const Crop             = require("../models/Crop");
const Order            = require("../models/Order");
const TransportRequest = require("../models/TransportRequest");

/**
 * Admin Controller
 *
 * All routes are protected by protect + authorize("admin") in adminRoutes.js.
 * No role checks are needed inside these handlers.
 *
 * Endpoints:
 *   GET    /api/v1/admin/stats              — dashboard statistics
 *
 *   GET    /api/v1/admin/users              — list users (search, filter, paginate)
 *   GET    /api/v1/admin/users/:id          — single user detail
 *   PATCH  /api/v1/admin/users/:id/toggle   — block / unblock (toggle isActive)
 *   DELETE /api/v1/admin/users/:id          — delete user (non-admin only)
 *
 *   GET    /api/v1/admin/crops              — list all crops (search, paginate)
 *   PATCH  /api/v1/admin/crops/:id/toggle   — toggle isAvailable
 *   DELETE /api/v1/admin/crops/:id          — delete any crop
 *
 *   GET    /api/v1/admin/orders             — list all orders (search, filter, paginate)
 *
 *   GET    /api/v1/admin/transport          — list all transport requests (filter, paginate)
 *   PATCH  /api/v1/admin/transport/:id/complete — mark request completed
 */

// ─── STATS ────────────────────────────────────────────────────────────────────
/**
 * @desc   Get dashboard statistics
 * @route  GET /api/v1/admin/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalFarmers,
    totalBuyers,
    totalTransporters,
    totalCrops,
    activeOrders,
    completedOrders,
    pendingTransport,
    ordersByStatus,
    usersByRole,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "farmer" }),
    User.countDocuments({ role: "buyer" }),
    User.countDocuments({ role: "transporter" }),
    Crop.countDocuments(),
    Order.countDocuments({ status: { $in: ["pending", "accepted", "assigned"] } }),
    Order.countDocuments({ status: "completed" }),
    TransportRequest.countDocuments({ status: "open" }),

    // For chart: orders grouped by status
    Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // For chart: users grouped by role
    User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalTransporters,
        totalCrops,
        activeOrders,
        completedOrders,
        pendingTransport,
      },
      charts: {
        ordersByStatus: ordersByStatus.map((o) => ({ status: o._id, count: o.count })),
        usersByRole:    usersByRole.map((u) => ({ role: u._id, count: u.count })),
      },
    },
  });
});

// ─── USERS ────────────────────────────────────────────────────────────────────

/**
 * @desc   Get all users with search, role filter, status filter, pagination
 * @route  GET /api/v1/admin/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const {
    search   = "",
    role     = "",
    status   = "",
    page     = 1,
    limit    = 15,
  } = req.query;

  const filter = {};

  if (search.trim()) {
    filter.$or = [
      { name:  { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (role && ["farmer", "buyer", "transporter", "admin"].includes(role)) {
    filter.role = role;
  }

  if (status === "active")   filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
  const skip     = (pageNum - 1) * limitNum;

  const [users, totalResults] = await Promise.all([
    User.find(filter)
      .select("-password -passwordResetToken -passwordResetExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      currentPage:     pageNum,
      totalPages:      Math.ceil(totalResults / limitNum),
      totalResults,
      hasNextPage:     pageNum < Math.ceil(totalResults / limitNum),
      hasPreviousPage: pageNum > 1,
    },
    data: { users },
  });
});

/**
 * @desc   Get single user by ID
 * @route  GET /api/v1/admin/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -passwordResetToken -passwordResetExpires");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Fetch activity counts
  const [cropCount, orderCount] = await Promise.all([
    user.role === "farmer" ? Crop.countDocuments({ owner: user._id }) : Promise.resolve(0),
    Order.countDocuments({
      $or: [{ buyer: user._id }, { farmer: user._id }],
    }),
  ]);

  res.status(200).json({
    success: true,
    data: { user, cropCount, orderCount },
  });
});

/**
 * @desc   Toggle user active status (block / unblock)
 * @route  PATCH /api/v1/admin/users/:id/toggle
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent admin from blocking themselves
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot block your own account");
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "unblocked" : "blocked"} successfully`,
    data: { user: user.toSafeObject() },
  });
});

/**
 * @desc   Delete a user (cannot delete admins)
 * @route  DELETE /api/v1/admin/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(403);
    throw new Error("Admin accounts cannot be deleted");
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot delete your own account");
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

// ─── CROPS ────────────────────────────────────────────────────────────────────

/**
 * @desc   Get all crops (admin sees everything including unavailable)
 * @route  GET /api/v1/admin/crops
 */
const getAllCropsAdmin = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 15, category = "", available = "" } = req.query;

  const filter = {};

  if (search.trim()) {
    filter.cropName = { $regex: search.trim(), $options: "i" };
  }

  if (category) filter.category = category;

  if (available === "true")  filter.isAvailable = true;
  if (available === "false") filter.isAvailable = false;

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
  const skip     = (pageNum - 1) * limitNum;

  const [crops, totalResults] = await Promise.all([
    Crop.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Crop.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      currentPage:     pageNum,
      totalPages:      Math.ceil(totalResults / limitNum),
      totalResults,
      hasNextPage:     pageNum < Math.ceil(totalResults / limitNum),
      hasPreviousPage: pageNum > 1,
    },
    data: { crops },
  });
});

/**
 * @desc   Toggle crop isAvailable
 * @route  PATCH /api/v1/admin/crops/:id/toggle
 */
const toggleCropAvailability = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    res.status(404);
    throw new Error("Crop not found");
  }

  crop.isAvailable = !crop.isAvailable;
  await crop.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `Crop marked as ${crop.isAvailable ? "available" : "unavailable"}`,
    data: { crop },
  });
});

/**
 * @desc   Delete any crop
 * @route  DELETE /api/v1/admin/crops/:id
 */
const deleteCropAdmin = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    res.status(404);
    throw new Error("Crop not found");
  }

  await crop.deleteOne();

  res.status(200).json({
    success: true,
    message: "Crop deleted successfully",
    data: null,
  });
});

// ─── ORDERS ───────────────────────────────────────────────────────────────────

/**
 * @desc   Get all orders with search, status filter, pagination
 * @route  GET /api/v1/admin/orders
 */
const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const { search = "", status = "", page = 1, limit = 15 } = req.query;

  const filter = {};

  if (search.trim()) {
    filter.cropName = { $regex: search.trim(), $options: "i" };
  }

  const VALID_STATUSES = ["pending", "accepted", "rejected", "assigned", "completed", "cancelled"];
  if (status && VALID_STATUSES.includes(status)) {
    filter.status = status;
  }

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
  const skip     = (pageNum - 1) * limitNum;

  const [orders, totalResults] = await Promise.all([
    Order.find(filter)
      .populate("buyer",  "name email")
      .populate("farmer", "name email")
      .populate("crop",   "cropName images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      currentPage:     pageNum,
      totalPages:      Math.ceil(totalResults / limitNum),
      totalResults,
      hasNextPage:     pageNum < Math.ceil(totalResults / limitNum),
      hasPreviousPage: pageNum > 1,
    },
    data: { orders },
  });
});

// ─── TRANSPORT ────────────────────────────────────────────────────────────────

/**
 * @desc   Get all transport requests with filter, pagination
 * @route  GET /api/v1/admin/transport
 */
const getAllTransportAdmin = asyncHandler(async (req, res) => {
  const { status = "", page = 1, limit = 15 } = req.query;

  const filter = {};

  const VALID_STATUSES = ["open", "assigned", "completed", "cancelled"];
  if (status && VALID_STATUSES.includes(status)) {
    filter.status = status;
  }

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
  const skip     = (pageNum - 1) * limitNum;

  const [requests, totalResults] = await Promise.all([
    TransportRequest.find(filter)
      .populate("farmer",      "name email phone")
      .populate("buyer",       "name email phone")
      .populate("transporter", "name email phone")
      .populate("order",       "totalAmount status cropName orderedQuantity unit")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    TransportRequest.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      currentPage:     pageNum,
      totalPages:      Math.ceil(totalResults / limitNum),
      totalResults,
      hasNextPage:     pageNum < Math.ceil(totalResults / limitNum),
      hasPreviousPage: pageNum > 1,
    },
    data: { requests },
  });
});

/**
 * @desc   Mark a transport request as completed
 * @route  PATCH /api/v1/admin/transport/:id/complete
 */
const completeTransport = asyncHandler(async (req, res) => {
  const tr = await TransportRequest.findById(req.params.id);

  if (!tr) {
    res.status(404);
    throw new Error("Transport request not found");
  }

  if (tr.status === "completed") {
    res.status(400);
    throw new Error("Transport request is already completed");
  }

  tr.status = "completed";
  await tr.save();

  // Update linked order status to completed
  await Order.findByIdAndUpdate(tr.order, { status: "completed" });

  res.status(200).json({
    success: true,
    message: "Transport request marked as completed",
    data: { request: tr },
  });
});

module.exports = {
  getStats,
  getUsers, getUserById, toggleUserStatus, deleteUser,
  getAllCropsAdmin, toggleCropAvailability, deleteCropAdmin,
  getAllOrdersAdmin,
  getAllTransportAdmin, completeTransport,
};
