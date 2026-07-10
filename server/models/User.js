const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema
 *
 * Design decisions:
 *
 * 1. Single collection for all roles.
 *    One `users` collection with a `role` field is easier to query, index,
 *    and maintain than four separate collections. Role-specific data (e.g.,
 *    farm details, vehicle info) will live in separate related schemas that
 *    reference this User by ObjectId.
 *
 * 2. Password hashing in pre-save hook.
 *    The controller never sees a plaintext password after validation.
 *    The hook only re-hashes if the password field was actually modified,
 *    preventing unnecessary work on profile updates.
 *
 * 3. `matchPassword` instance method.
 *    Keeps the bcrypt.compare logic inside the model — the controller just
 *    calls user.matchPassword(candidatePassword) and gets a boolean back.
 *    Business logic stays in the right layer.
 *
 * 4. `select: false` on password.
 *    The password hash is excluded from every query by default.
 *    Controllers that need it (login) must explicitly opt in with
 *    .select("+password").
 *
 * 5. `isActive` flag instead of hard-delete.
 *    Users are never deleted from the database. Admins can deactivate
 *    accounts. This preserves referential integrity across orders, chats, etc.
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,  // Normalize before saving
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries unless explicitly requested
    },

    role: {
      type: String,
      enum: {
        values: ["farmer", "buyer", "transporter", "admin"],
        message: "Role must be one of: farmer, buyer, transporter, admin",
      },
      default: "buyer",
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, "Please provide a valid phone number"],
      default: null,
    },

    avatar: {
      type: String,           // Cloudinary URL
      default: null,
    },

    address: {
      street:  { type: String, trim: true, default: null },
      city:    { type: String, trim: true, default: null },
      state:   { type: String, trim: true, default: null },
      country: { type: String, trim: true, default: "India" },
      pincode: { type: String, trim: true, default: null },
    },

    isActive: {
      type: Boolean,
      default: true,  // Admin can set false to deactivate without deleting
    },

    isEmailVerified: {
      type: Boolean,
      default: false, // Email verification flow added in a later phase
    },

    // Password reset fields (used in forgot-password flow, later phase)
    passwordResetToken:   { type: String, select: false, default: undefined },
    passwordResetExpires: { type: Date,   select: false, default: undefined },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// email is already indexed via `unique: true`.
// role index speeds up admin queries that filter by role.
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ─── Pre-save Hook: Password Hashing ─────────────────────────────────────────
/**
 * Only runs when the password field is new or modified.
 * Salt rounds = 12 is a good production balance between security and speed.
 * (10 is fine for dev; 14+ is for very high-security contexts.)
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method: Password Comparison ────────────────────────────────────
/**
 * @param {string} candidatePassword - The plaintext password from the request
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Safe User Object ───────────────────────────────────────
/**
 * Returns a plain object with sensitive fields stripped.
 * Use this whenever you send a user object in an API response.
 */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.__v;
  return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
