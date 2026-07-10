const mongoose = require("mongoose");

/**
 * Order Schema
 *
 * Lifecycle:
 *   pending   → Buyer placed the order, waiting for farmer
 *   accepted  → Farmer accepted; TransportRequest auto-created
 *   rejected  → Farmer declined the order
 *   assigned  → Transporter accepted the delivery
 *   completed → Delivery confirmed complete
 *   cancelled → Buyer or admin cancelled before acceptance
 *
 * Design decisions:
 *
 * 1. We snapshot price and unit at order time.
 *    If the farmer later changes the crop price, historical orders
 *    remain accurate. totalAmount = orderedQuantity × priceAtOrder.
 *
 * 2. crop, buyer, farmer are all ObjectId refs.
 *    farmer is denormalised here (same as crop.owner) so order queries
 *    don't need to join through Crop to find the farmer.
 *
 * 3. deliveryAddress is embedded, not a ref.
 *    Addresses are small and order-specific — embedding avoids an
 *    extra collection and a join on every order read.
 */

const ORDER_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "assigned",
  "completed",
  "cancelled",
];

const orderSchema = new mongoose.Schema(
  {
    crop: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Crop",
      required: [true, "Order must reference a crop"],
    },

    buyer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Order must have a buyer"],
    },

    farmer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Order must have a farmer"],
    },

    // Snapshot at order time — never mutated after creation
    cropName: {
      type:     String,
      required: true,
      trim:     true,
    },

    orderedQuantity: {
      type:     Number,
      required: [true, "Ordered quantity is required"],
      min:      [0.1,  "Quantity must be greater than 0"],
    },

    unit: {
      type:     String,
      required: true,
    },

    priceAtOrder: {
      type:     Number,
      required: [true, "Price at order time is required"],
      min:      [0,    "Price cannot be negative"],
    },

    totalAmount: {
      type:     Number,
      required: true,
      min:      [0, "Total amount cannot be negative"],
    },

    status: {
      type:    String,
      enum:    {
        values:  ORDER_STATUSES,
        message: `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
      },
      default: "pending",
    },

    // Optional buyer delivery address
    deliveryAddress: {
      street:  { type: String, trim: true, default: "" },
      city:    { type: String, trim: true, default: "" },
      state:   { type: String, trim: true, default: "" },
      pincode: { type: String, trim: true, default: "" },
    },

    // Buyer notes to farmer (e.g. "please pack in 10 kg bags")
    buyerNote: {
      type:     String,
      trim:     true,
      maxlength: [300, "Note cannot exceed 300 characters"],
      default:  "",
    },

    // Set when farmer accepts or rejects
    farmerNote: {
      type:    String,
      trim:    true,
      maxlength: [300, "Note cannot exceed 300 characters"],
      default: "",
    },

    // Ref to the linked transport request (set when farmer accepts)
    transportRequest: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "TransportRequest",
      default: null,
    },
  },
  {
    timestamps: true, // createdAt = order placed date
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ buyer:  1, createdAt: -1 }); // buyer's order history
orderSchema.index({ farmer: 1, createdAt: -1 }); // farmer's received orders
orderSchema.index({ crop:   1 });                 // all orders for a crop
orderSchema.index({ status: 1 });                 // filter by status

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
