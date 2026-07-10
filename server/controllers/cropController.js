const asyncHandler = require("express-async-handler");
const Crop = require("../models/Crop");

/**
 * Crop Controller — createCrop, getAllCrops, getCropById, updateCrop, deleteCrop
 *
 * Security model:
 *  - All endpoints require authentication (protect middleware applied in routes)
 *  - createCrop  → farmer only (authorize("farmer") in routes)
 *  - getAllCrops → any authenticated user
 *  - getCropById → any authenticated user
 *  - updateCrop  → owner OR admin (checked in controller after DB fetch)
 *  - deleteCrop  → owner OR admin (checked in controller after DB fetch)
 *
 * Why is owner/admin check done in the controller, not a middleware?
 *  Because we need to fetch the crop document first to read crop.owner.
 *  Doing that check in a middleware would mean two DB fetches (once in
 *  middleware, once in controller). A single fetch + inline check is cleaner.
 *
 * Response shape (consistent with authController):
 *  { success: true, message: "...", data: { ... } }
 */

// ─── HELPER ───────────────────────────────────────────────────────────────────
/**
 * Checks whether the requesting user is the crop owner or an admin.
 * @param {Object} crop    - Mongoose Crop document
 * @param {Object} reqUser - req.user set by protect middleware
 * @returns {boolean}
 */
const isOwnerOrAdmin = (crop, reqUser) => {
  return (
    crop.owner._id.toString() === reqUser._id.toString() ||
    reqUser.role === "admin"
  );
};

// ─── CREATE CROP ──────────────────────────────────────────────────────────────
/**
 * @desc    Create a new crop listing
 * @route   POST /api/v1/crops
 * @access  Private — Farmer only
 */
const createCrop = asyncHandler(async (req, res) => {
  const {
    cropName,
    category,
    quantity,
    unit,
    price,
    description,
    harvestDate,
    images,
    location,
  } = req.body;

  // ── Required Field Validation ─────────────────────────────────────────────
  if (!cropName || !category || !quantity || !price) {
    res.status(400);
    throw new Error("cropName, category, quantity, and price are required");
  }

  // ── Location Validation ───────────────────────────────────────────────────
  if (!location || !location.state || !location.district) {
    res.status(400);
    throw new Error("location.state and location.district are required");
  }

  // ── Numeric Validation ────────────────────────────────────────────────────
  if (isNaN(quantity) || Number(quantity) <= 0) {
    res.status(400);
    throw new Error("Quantity must be a positive number");
  }

  if (isNaN(price) || Number(price) < 0) {
    res.status(400);
    throw new Error("Price must be a non-negative number");
  }

  // ── Build Images Array ────────────────────────────────────────────────────
  // Accept pre-formed [{ url, publicId }] objects or plain URL strings.
  // Phase 3 supports manual URL entry. Cloudinary upload replaces this later.
  let processedImages = [];
  if (images && Array.isArray(images)) {
    processedImages = images.map((img) => {
      if (typeof img === "string") {
        return { url: img, publicId: null };
      }
      if (typeof img === "object" && img.url) {
        return { url: img.url, publicId: img.publicId || null };
      }
      return null;
    }).filter(Boolean); // Remove any null entries
  }

  // ── Create Document ───────────────────────────────────────────────────────
  const crop = await Crop.create({
    cropName:    cropName.trim(),
    category,
    quantity:    Number(quantity),
    unit:        unit || "kg",
    price:       Number(price),
    description: description?.trim() || "",
    harvestDate: harvestDate || null,
    images:      processedImages,
    location: {
      state:    location.state.trim(),
      district: location.district.trim(),
      village:  location.village?.trim() || "",
    },
    isAvailable: true,
    owner:       req.user._id,
  });

  // Populate owner info for the response
  await crop.populate("owner", "name email phone");

  res.status(201).json({
    success: true,
    message: "Crop listing created successfully",
    data: { crop },
  });
});

// ─── GET ALL CROPS ────────────────────────────────────────────────────────────
/**
 * @desc    Get crop listings with search, filters, sorting, and pagination
 * @route   GET /api/v1/crops
 * @access  Private — Any authenticated user
 *
 * Query parameters:
 *   keyword    {string}  — case-insensitive search on cropName (text index)
 *   category   {string}  — exact match on category enum
 *   state      {string}  — case-insensitive match on location.state
 *   district   {string}  — case-insensitive match on location.district
 *   minPrice   {number}  — price >= minPrice
 *   maxPrice   {number}  — price <= maxPrice
 *   sort       {string}  — "latest" | "price_asc" | "price_desc" | "harvest"
 *   page       {number}  — 1-indexed page number (default: 1)
 *   limit      {number}  — results per page (default: 12, max: 50)
 *
 * Response includes pagination metadata:
 *   { success, count, pagination: { currentPage, totalPages,
 *     totalResults, hasNextPage, hasPreviousPage }, data: { crops } }
 */
const getAllCrops = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    state,
    district,
    minPrice,
    maxPrice,
    sort    = "latest",
    page    = 1,
    limit   = 12,
  } = req.query;

  // ── Base availability filter ──────────────────────────────────────────────
  const filter = req.user.role === "admin" ? {} : { isAvailable: true };

  // ── Keyword search ────────────────────────────────────────────────────────
  // Uses the text index on cropName (weight 10) and description (weight 5).
  // Falls back to a regex match on cropName so partial words still work
  // when the text index hasn't been triggered (e.g., single characters).
  if (keyword && keyword.trim()) {
    const term = keyword.trim();
    filter.cropName = { $regex: term, $options: "i" };
  }

  // ── Category filter ───────────────────────────────────────────────────────
  const VALID_CATEGORIES = [
    "vegetables","fruits","grains","pulses",
    "spices","oilseeds","dairy","poultry","other",
  ];
  if (category && VALID_CATEGORIES.includes(category.toLowerCase())) {
    filter.category = category.toLowerCase();
  }

  // ── Location filters ──────────────────────────────────────────────────────
  if (state && state.trim()) {
    filter["location.state"] = { $regex: state.trim(), $options: "i" };
  }
  if (district && district.trim()) {
    filter["location.district"] = { $regex: district.trim(), $options: "i" };
  }

  // ── Price range ───────────────────────────────────────────────────────────
  const priceFilter = {};
  if (minPrice && !isNaN(minPrice) && Number(minPrice) >= 0) {
    priceFilter.$gte = Number(minPrice);
  }
  if (maxPrice && !isNaN(maxPrice) && Number(maxPrice) >= 0) {
    priceFilter.$lte = Number(maxPrice);
  }
  if (Object.keys(priceFilter).length > 0) {
    filter.price = priceFilter;
  }

  // ── Sort mapping ──────────────────────────────────────────────────────────
  const SORT_MAP = {
    latest:     { createdAt: -1 },
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    harvest:    { harvestDate: 1 },
  };
  const sortObj = SORT_MAP[sort] || SORT_MAP.latest;

  // ── Pagination ────────────────────────────────────────────────────────────
  const pageNum   = Math.max(1, parseInt(page,  10) || 1);
  const limitNum  = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip      = (pageNum - 1) * limitNum;

  // ── Execute query + count in parallel ────────────────────────────────────
  const [crops, totalResults] = await Promise.all([
    Crop.find(filter)
      .populate("owner", "name email phone")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Crop.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalResults / limitNum);

  res.status(200).json({
    success: true,
    count:   crops.length,
    pagination: {
      currentPage:     pageNum,
      totalPages:      totalPages,
      totalResults:    totalResults,
      hasNextPage:     pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
      limit:           limitNum,
    },
    data: { crops },
  });
});

// ─── GET CROP BY ID ───────────────────────────────────────────────────────────
/**
 * @desc    Get a single crop listing by ID
 * @route   GET /api/v1/crops/:id
 * @access  Private — Any authenticated user
 */
const getCropById = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id).populate(
    "owner",
    "name email phone address"
  );

  if (!crop) {
    res.status(404);
    throw new Error("Crop listing not found");
  }

  // Non-admin users cannot view unavailable listings
  if (!crop.isAvailable && req.user.role !== "admin") {
    res.status(404);
    throw new Error("Crop listing not found");
    // We throw 404 (not 403) so the listing's existence isn't revealed
  }

  res.status(200).json({
    success: true,
    data: { crop },
  });
});

// ─── UPDATE CROP ──────────────────────────────────────────────────────────────
/**
 * @desc    Update a crop listing
 * @route   PUT /api/v1/crops/:id
 * @access  Private — Owner (farmer) or Admin
 */
const updateCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    res.status(404);
    throw new Error("Crop listing not found");
  }

  // ── Authorization Check ───────────────────────────────────────────────────
  if (!isOwnerOrAdmin(crop, req.user)) {
    res.status(403);
    throw new Error("Not authorized — you can only update your own listings");
  }

  // ── Whitelist Updatable Fields ────────────────────────────────────────────
  // Explicitly list what can be updated to prevent mass-assignment attacks.
  // Fields like `owner` and `_id` are never touched.
  const allowedUpdates = [
    "cropName",
    "category",
    "quantity",
    "unit",
    "price",
    "description",
    "harvestDate",
    "images",
    "location",
    "isAvailable",
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // ── Numeric Coercion ──────────────────────────────────────────────────────
  if (updates.quantity !== undefined) {
    if (isNaN(updates.quantity) || Number(updates.quantity) <= 0) {
      res.status(400);
      throw new Error("Quantity must be a positive number");
    }
    updates.quantity = Number(updates.quantity);
  }

  if (updates.price !== undefined) {
    if (isNaN(updates.price) || Number(updates.price) < 0) {
      res.status(400);
      throw new Error("Price must be a non-negative number");
    }
    updates.price = Number(updates.price);
  }

  // ── Location Partial Update ───────────────────────────────────────────────
  // Merge incoming location fields with existing ones so a partial location
  // update doesn't wipe out fields the user didn't send.
  if (updates.location) {
    updates.location = {
      state:    updates.location.state?.trim()    || crop.location.state,
      district: updates.location.district?.trim() || crop.location.district,
      village:  updates.location.village?.trim()  ?? crop.location.village,
    };
  }

  // ── Image Processing ──────────────────────────────────────────────────────
  if (updates.images && Array.isArray(updates.images)) {
    updates.images = updates.images.map((img) => {
      if (typeof img === "string") return { url: img, publicId: null };
      if (typeof img === "object" && img.url) {
        return { url: img.url, publicId: img.publicId || null };
      }
      return null;
    }).filter(Boolean);
  }

  // ── Apply Updates ─────────────────────────────────────────────────────────
  // runValidators: true ensures Mongoose schema validators run on update
  const updatedCrop = await Crop.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("owner", "name email phone");

  res.status(200).json({
    success: true,
    message: "Crop listing updated successfully",
    data: { crop: updatedCrop },
  });
});

// ─── DELETE CROP ──────────────────────────────────────────────────────────────
/**
 * @desc    Delete a crop listing
 * @route   DELETE /api/v1/crops/:id
 * @access  Private — Owner (farmer) or Admin
 *
 * Note: This is a hard delete. In Phase 7 (Orders) we will reconsider
 * this if active orders reference a crop — we may switch to soft-delete
 * (isAvailable: false) for crops that have pending orders.
 */
const deleteCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    res.status(404);
    throw new Error("Crop listing not found");
  }

  // ── Authorization Check ───────────────────────────────────────────────────
  if (!isOwnerOrAdmin(crop, req.user)) {
    res.status(403);
    throw new Error("Not authorized — you can only delete your own listings");
  }

  // TODO (Phase 7): Before deleting, check if any active orders reference
  // this crop. If so, prevent deletion or switch to soft-delete.

  // TODO (Cloudinary phase): Loop through crop.images and call
  // cloudinary.uploader.destroy(img.publicId) for each image before deleting.

  await crop.deleteOne();

  res.status(200).json({
    success: true,
    message: "Crop listing deleted successfully",
    data: null,
  });
});

module.exports = {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
};
