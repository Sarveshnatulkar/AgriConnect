const asyncHandler = require("express-async-handler");
const User         = require("../models/User");

/**
 * User Controller — profile update and password change.
 *
 * These are separate from authController intentionally:
 *  authController  handles authentication (login/logout/register)
 *  userController  handles profile management (update info, change password)
 */

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
/**
 * @desc    Update the authenticated user's profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 *
 * Updatable fields: name, phone, address, avatar
 * NOT updatable here: email (unique, requires email verification flow),
 *                     role (admin function), password (separate endpoint)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ── Validation ────────────────────────────────────────────────────────────
  if (name !== undefined) {
    const trimmed = name.trim();
    if (trimmed.length < 2)  { res.status(400); throw new Error("Name must be at least 2 characters"); }
    if (trimmed.length > 50) { res.status(400); throw new Error("Name cannot exceed 50 characters"); }
    user.name = trimmed;
  }

  if (phone !== undefined) {
    // phone may arrive as null (cleared by user) or as a string — guard both
    user.phone = (typeof phone === "string" ? phone.trim() : "") || null;
  }

  if (address !== undefined && typeof address === "object") {
    user.address = {
      street:  address.street?.trim()  || user.address?.street  || null,
      city:    address.city?.trim()    || user.address?.city    || null,
      state:   address.state?.trim()   || user.address?.state   || null,
      country: address.country?.trim() || user.address?.country || "India",
      pincode: address.pincode?.trim() || user.address?.pincode || null,
    };
  }

  // avatar is a Cloudinary URL set by the frontend after uploading directly
  if (avatar !== undefined) {
    user.avatar = avatar || null;
  }

  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user: user.toSafeObject() },
  });
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
/**
 * @desc    Change the authenticated user's password
 * @route   PATCH /api/v1/users/password
 * @access  Private
 *
 * Requires current password for security — prevents session hijacking attacks.
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error("Current password, new password, and confirm password are all required");
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters");
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("New password and confirm password do not match");
  }

  if (currentPassword === newPassword) {
    res.status(400);
    throw new Error("New password must be different from your current password");
  }

  // Fetch user with password (excluded by default via `select: false`)
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ── Verify current password ───────────────────────────────────────────────
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Pre-save hook hashes the new password automatically
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

module.exports = { updateProfile, changePassword };
