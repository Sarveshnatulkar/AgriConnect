const mongoose = require("mongoose");

/**
 * TransportRequest Schema
 *
 * A transport request is automatically created when a farmer
 * accepts an order. Transporters browse available requests and
 * accept one. Once accepted, the linked Order status → "assigned".
 *
 * Status lifecycle:
 *   open       → Created when farmer accepts order; visible to transporters
 *   assigned   → A transporter claimed this request
 *   completed  → Delivery confirmed (future phase)
 *   cancelled  → Order was cancelled or rejected before a transporter claimed it
 *
 * Design decisions:
 *
 * 1. pickup and dropoff addresses are embedded.
 *    pickup = crop's farm location (from Order → Crop)
 *    dropoff = buyer's delivery address (from Order.deliveryAddress)
 *    Both are snapshotted so address changes later don't corrupt records.
 *
 * 2. transporter field is null until someone accepts.
 *    This makes it easy to query { transporter: null, status: "open" }
 *    for the "Available Requests" view.
 */

const TRANSPORT_STATUSES = ["open", "assigned", "completed", "cancelled"];

const transportRequestSchema = new mongoose.Schema(
  {
    order: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Order",
      required: [true, "Transport request must be linked to an order"],
      unique:   true, // one transport request per order
    },

    farmer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    buyer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // null until a transporter accepts
    transporter: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },

    // Snapshot of crop / order data for display in transport dashboard
    cropName: {
      type:    String,
      trim:    true,
      default: "",
    },

    quantity: {
      type: Number,
      min:  [0, "Quantity cannot be negative"],
    },

    unit: {
      type: String,
      default: "kg",
    },

    // Pickup = farm location
    pickupAddress: {
      state:    { type: String, trim: true, default: "" },
      district: { type: String, trim: true, default: "" },
      village:  { type: String, trim: true, default: "" },
    },

    // Dropoff = buyer's delivery address
    dropoffAddress: {
      street:  { type: String, trim: true, default: "" },
      city:    { type: String, trim: true, default: "" },
      state:   { type: String, trim: true, default: "" },
      pincode: { type: String, trim: true, default: "" },
    },

    status: {
      type:    String,
      enum:    {
        values:  TRANSPORT_STATUSES,
        message: `Status must be one of: ${TRANSPORT_STATUSES.join(", ")}`,
      },
      default: "open",
    },

    // Optional notes from farmer to transporter
    notes: {
      type:      String,
      trim:      true,
      maxlength: [300, "Notes cannot exceed 300 characters"],
      default:   "",
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
transportRequestSchema.index({ status: 1 });              // open requests feed
transportRequestSchema.index({ transporter: 1 });         // transporter's jobs
transportRequestSchema.index({ farmer: 1 });              // farmer's transport history
transportRequestSchema.index({ status: 1, transporter: 1 }); // available query

const TransportRequest = mongoose.model(
  "TransportRequest",
  transportRequestSchema
);

module.exports = TransportRequest;
