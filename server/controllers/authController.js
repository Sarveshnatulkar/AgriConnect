const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * Auth Controller — Register, Login, Logout, Get Current User
 *
 * All functions are wrapped with asyncHandler so any thrown error
 * automatically flows to errorMiddleware without explicit try/catch.
 *
 * Response shape is consistent across all endpoints:
 * {
 *   success: true | false,
 *   message: "...",
 *   data: { ... }   ← only on success
 * }
 */

// ─── REGISTER ────────────────────────────────────────────────────────────────
/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // ── Input Validation ──────────────────────────────────────────────────────
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  // Validate role if provided (default is handled by the schema, but we
  // want to give a helpful message instead of a Mongoose cast error)
  const allowedRoles = ["farmer", "buyer", "transporter"];
  if (role && !allowedRoles.includes(role)) {
    res.status(400);
    // Admin accounts are created only through seeding or another admin.
    // We intentionally block self-registration as admin.
    throw new Error(
      "Invalid role. Must be one of: farmer, buyer, transporter"
    );
  }

  // ── Duplicate Check ───────────────────────────────────────────────────────
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    res.status(409); // 409 Conflict is more accurate than 400 for duplicates
    throw new Error("An account with this email already exists");
  }

  // ── Create User ───────────────────────────────────────────────────────────
  // Password hashing happens in the pre-save hook — controller stays clean
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: role || "buyer",
    phone: phone || undefined,
  });

  // ── Issue JWT Cookie ──────────────────────────────────────────────────────
  generateToken(res, user._id);

  // ── Update lastLogin ──────────────────────────────────────────────────────
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: user.toSafeObject(),
    },
  });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
/**
 * @desc    Authenticate user and issue JWT cookie
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ── Input Validation ──────────────────────────────────────────────────────
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // ── Find User (include password for comparison) ───────────────────────────
  // `.select("+password")` opts back in to the field hidden by `select: false`
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  if (!user) {
    res.status(401);
    // Generic message — don't reveal whether the email exists
    throw new Error("Invalid email or password");
  }

  // ── Check Account Status ──────────────────────────────────────────────────
  if (!user.isActive) {
    res.status(403);
    throw new Error(
      "Your account has been deactivated. Please contact support."
    );
  }

  // ── Compare Password ──────────────────────────────────────────────────────
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // ── Issue JWT Cookie ──────────────────────────────────────────────────────
  generateToken(res, user._id);

  // ── Update lastLogin ──────────────────────────────────────────────────────
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      user: user.toSafeObject(),
    },
  });
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
/**
 * @desc    Clear the JWT cookie to log out the user
 * @route   POST /api/v1/auth/logout
 * @access  Private (must be logged in to log out)
 */
const logout = asyncHandler(async (req, res) => {
  // Overwrite the cookie with an empty value and an immediate expiry.
  // The options must match the original cookie (httpOnly, sameSite, secure)
  // otherwise the browser won't recognize it as the same cookie to clear.
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), // Immediately expired
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
/**
 * @desc    Get the currently authenticated user's profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by the protect middleware.
  // We re-fetch from DB to guarantee fresh data (role changes, deactivation).
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.toSafeObject(),
    },
  });
});

module.exports = { register, login, logout, getMe };
