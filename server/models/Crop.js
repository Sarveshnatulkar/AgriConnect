const mongoose = require("mongoose");

/**
 * Crop Schema
 *
 * Design decisions:
 *
 * 1. `owner` references User by ObjectId.
 *    We populate only the fields we need (name, email, phone) when
 *    returning crop details — never the full user document.
 *
 * 2. Images stored as [{ url, publicId }] objects, not plain strings.
 *    publicId is the Cloudinary asset identifier. When we integrate
 *    Cloudinary uploads (later phase), we need publicId to delete images
 *    from the cloud. A plain URL string makes cleanup impossible.
 *
 * 3. Location is a nested object, not a separate collection.
 *    Crop location (state/district/village) is simple key-value data.
 *    Embedding it avoids a join. GeoJSON coordinates are reserved for
 *    the Maps phase where we'll add a 2dsphere index.
 *
 * 4. `priceUnit` is separate from `unit`.
 *    `unit` describes the quantity (e.g., "kg"), while `priceUnit` is
 *    always "per [unit]" — e.g., "₹ 40 per kg". This gives the buyer
 *    clear pricing context.
 *
 * 5. `isAvailable` soft-toggle instead of deletion.
 *    Farmers can mark crops as sold/unavailable without losing the record.
 *    Order history and analytics depend on past crop records existing.
 *
 * 6. Compound indexes for Phase 4 (search + filters).
 *    Indexes are defined now so performance is good from day one.
 */

const cropSchema = new mongoose.Schema(
  {
    // ── Core Details ────────────────────────────────────────────────────────
    cropName: {
      type: String,
      required: [true, "Crop name is required"],
      trim: true,
      minlength: [2, "Crop name must be at least 2 characters"],
      maxlength: [100, "Crop name cannot exceed 100 characters"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: [
          "vegetables",
          "fruits",
          "grains",
          "pulses",
          "spices",
          "oilseeds",
          "dairy",
          "poultry",
          "other",
        ],
        message:
          "Category must be one of: vegetables, fruits, grains, pulses, spices, oilseeds, dairy, poultry, other",
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    // ── Quantity & Pricing ───────────────────────────────────────────────────
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.1, "Quantity must be greater than 0"],
    },

    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: {
        values: ["kg", "quintal", "ton", "bag", "dozen", "piece", "litre"],
        message:
          "Unit must be one of: kg, quintal, ton, bag, dozen, piece, litre",
      },
      default: "kg",
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Price is always "per unit" — e.g., ₹40 per kg
    // Stored explicitly so the frontend doesn't need to construct this string
    priceUnit: {
      type: String,
      default: function () {
        return this.unit || "kg";
      },
    },

    // ── Harvest Info ─────────────────────────────────────────────────────────
    harvestDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // harvestDate should not be in the future by more than 2 years
          if (!value) return true;
          const twoYearsFromNow = new Date();
          twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
          return value <= twoYearsFromNow;
        },
        message: "Harvest date seems too far in the future",
      },
    },

    // ── Images ───────────────────────────────────────────────────────────────
    // Each image has a `url` (for display) and `publicId` (for Cloudinary cleanup)
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: null, // null until Cloudinary integration is added
        },
      },
    ],

    // ── Location ─────────────────────────────────────────────────────────────
    location: {
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      district: {
        type: String,
        required: [true, "District is required"],
        trim: true,
      },
      village: {
        type: String,
        trim: true,
        default: "",
      },
      // GeoJSON point — will be activated in the Maps phase
      // coordinates: { type: [Number], index: "2dsphere" }
    },

    // ── Status ───────────────────────────────────────────────────────────────
    isAvailable: {
      type: Boolean,
      default: true, // False when farmer marks it sold or removes from marketplace
    },

    // ── Ownership ────────────────────────────────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Crop must belong to a farmer"],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// These support Phase 4 search, filter, and sort operations.

cropSchema.index({ owner: 1 });                        // "My crops" queries
cropSchema.index({ category: 1 });                     // Filter by category
cropSchema.index({ isAvailable: 1 });                  // Available listings
cropSchema.index({ "location.state": 1 });             // Filter by state
cropSchema.index({ "location.district": 1 });          // Filter by district
cropSchema.index({ price: 1 });                        // Sort by price
cropSchema.index({ createdAt: -1 });                   // Sort by newest
cropSchema.index({ category: 1, isAvailable: 1 });     // Combined filter
cropSchema.index({ "location.state": 1, isAvailable: 1 }); // Location + availability

// Text index for Phase 4 full-text search on cropName and description
cropSchema.index(
  { cropName: "text", description: "text" },
  { weights: { cropName: 10, description: 5 } }
);

const Crop = mongoose.model("Crop", cropSchema);

module.exports = Crop;
