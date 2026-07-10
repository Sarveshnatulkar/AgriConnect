import { useState, useEffect, useRef } from "react";
import { HiX, HiOutlineShoppingCart, HiOutlineLocationMarker } from "react-icons/hi";
import { FaBoxOpen } from "react-icons/fa";
import Button from "../common/Button";
import { placeOrder } from "../../services/orderService";
import { formatCurrency, getErrorMessage } from "../../utils/helpers";
import toast from "react-hot-toast";

/**
 * PlaceOrderModal — buyer enters quantity and optional delivery details,
 * then confirms the order.
 *
 * Props:
 *  @param {Object}   crop     - full crop object from CropDetailPage
 *  @param {Function} onClose  - called to dismiss the modal
 *  @param {Function} onSuccess - called after successful order (optional)
 *
 * The modal is accessible:
 *  - role="dialog" + aria-modal
 *  - Escape closes it
 *  - Body scroll locked while open
 *  - Close button auto-focused on open
 */
const PlaceOrderModal = ({ crop, onClose, onSuccess }) => {
  const [qty,          setQty]         = useState("");
  const [street,       setStreet]      = useState("");
  const [city,         setCity]        = useState("");
  const [state,        setState]       = useState("");
  const [pincode,      setPincode]     = useState("");
  const [buyerNote,    setBuyerNote]   = useState("");
  const [submitting,   setSubmitting]  = useState(false);
  const [errors,       setErrors]      = useState({});
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const totalAmount = qty && !isNaN(qty) && Number(qty) > 0
    ? (Number(qty) * crop.price).toFixed(2)
    : null;

  const validate = () => {
    const e = {};
    if (!qty || isNaN(qty) || Number(qty) <= 0)
      e.qty = "Enter a valid positive quantity";
    if (Number(qty) > crop.quantity)
      e.qty = `Maximum available quantity is ${crop.quantity} ${crop.unit}`;
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await placeOrder({
        cropId:          crop._id,
        orderedQuantity: Number(qty),
        deliveryAddress: { street, city, state, pincode },
        buyerNote,
      });
      toast.success("Order placed successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg
                      animate-fade-in overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineShoppingCart className="text-primary-600 text-lg" />
            </div>
            <div>
              <h2 id="order-modal-title" className="font-bold text-gray-900 text-base">
                Place Order
              </h2>
              <p className="text-xs text-gray-400">{crop.cropName}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                       flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <HiX className="text-base text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} noValidate id="order-form">
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Crop summary */}
              <div className="bg-primary-50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={crop.images?.[0]?.url || "https://placehold.co/56x56/f0fdf4/16a34a?text=🌾"}
                    alt={crop.cropName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/56x56/f0fdf4/16a34a?text=🌾"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{crop.cropName}</p>
                  <p className="text-sm text-primary-700 font-semibold">
                    {formatCurrency(crop.price)} / {crop.priceUnit || crop.unit}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <FaBoxOpen className="text-xs" />
                    {crop.quantity} {crop.unit} available
                  </p>
                </div>
              </div>

              {/* Quantity input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="qty" className="text-sm font-medium text-gray-700">
                  Quantity ({crop.unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  id="qty"
                  type="number"
                  min="0.1"
                  max={crop.quantity}
                  step="0.1"
                  value={qty}
                  onChange={(e) => { setQty(e.target.value); setErrors({}); }}
                  placeholder={`Max ${crop.quantity} ${crop.unit}`}
                  disabled={submitting}
                  className={`input-field ${errors.qty ? "border-red-400 focus:ring-red-400" : ""}`}
                />
                {errors.qty && (
                  <p role="alert" className="text-xs text-red-500">{errors.qty}</p>
                )}
                {/* Live total */}
                {totalAmount && (
                  <div className="flex items-center justify-between bg-gray-50
                                  rounded-lg px-3 py-2 mt-1">
                    <span className="text-xs text-gray-500">Estimated Total</span>
                    <span className="font-bold text-primary-600 text-sm">
                      {formatCurrency(parseFloat(totalAmount))}
                    </span>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <HiOutlineLocationMarker className="text-gray-400" />
                  Delivery Address
                  <span className="text-xs text-gray-400 font-normal">(optional)</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Street / Area"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    disabled={submitting}
                    className="input-field col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={submitting}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={submitting}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    disabled={submitting}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Note to farmer */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="note" className="text-sm font-medium text-gray-700">
                  Note to Farmer
                  <span className="text-xs text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  id="note"
                  rows={2}
                  maxLength={300}
                  placeholder="e.g. Please pack in 10 kg bags"
                  value={buyerNote}
                  onChange={(e) => setBuyerNote(e.target.value)}
                  disabled={submitting}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="order-form"
            variant="primary"
            loading={submitting}
            className="flex-1"
          >
            Confirm Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderModal;
