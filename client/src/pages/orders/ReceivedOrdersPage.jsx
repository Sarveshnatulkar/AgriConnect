import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineClipboardList,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineChatAlt,
} from "react-icons/hi";
import { FaBoxOpen, FaMapMarkerAlt, FaUser, FaTruck } from "react-icons/fa";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import { fetchReceivedOrders, updateOrderStatus } from "../../services/orderService";
import { formatCurrency, formatDate, getErrorMessage } from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";

/**
 * ReceivedOrdersPage — farmer view of all incoming orders for their crops.
 *
 * Route:  /orders/received
 * Access: Farmer only
 *
 * Features:
 *  - Lists all received orders newest first
 *  - Accept / Reject buttons for pending orders
 *  - Reject modal with optional note
 *  - Inline status badge
 *  - On accept → transport request is auto-created (backend side effect)
 *  - Loading / error / empty states
 */

const PLACEHOLDER = "https://placehold.co/80x80/f0fdf4/16a34a?text=🌾";

// ── Reject modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ order, onConfirm, onCancel, loading }) => {
  const [note, setNote] = useState("");
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100
                      w-full max-w-sm p-6 flex flex-col gap-5 animate-fade-in">
        <div>
          <h2 id="reject-modal-title" className="font-bold text-gray-900 text-base">
            Reject Order?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Order for <span className="font-semibold">{order.cropName}</span> by{" "}
            <span className="font-semibold">{order.buyer?.name}</span>
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reject-note" className="text-sm font-medium text-gray-700">
            Reason <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="reject-note"
            rows={3}
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Crop no longer available at this price"
            className="input-field resize-none text-sm"
            disabled={loading}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(note)}
            loading={loading}
            className="flex-1"
          >
            Reject Order
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ReceivedOrdersPage = () => {
  const [orders,      setOrders]     = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState(null);
  const [processing,  setProcessing] = useState(null);  // order._id being processed
  const [rejectModal, setRejectModal]= useState(null);  // order being rejected

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchReceivedOrders();
      setOrders(res.data.orders);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // ── Accept order ──────────────────────────────────────────────────────────
  const handleAccept = async (order) => {
    setProcessing(order._id);
    try {
      const res = await updateOrderStatus(order._id, { status: "accepted" });
      setOrders((prev) =>
        prev.map((o) => o._id === order._id ? res.data.order : o)
      );
      toast.success(`Order accepted — transport request created!`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(null);
    }
  };

  // ── Reject order ──────────────────────────────────────────────────────────
  const handleReject = async (note) => {
    if (!rejectModal) return;
    setProcessing(rejectModal._id);
    try {
      const res = await updateOrderStatus(rejectModal._id, {
        status: "rejected",
        farmerNote: note,
      });
      setOrders((prev) =>
        prev.map((o) => o._id === rejectModal._id ? res.data.order : o)
      );
      toast.success("Order rejected");
      setRejectModal(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(null);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Spinner size="w-10 h-10" />
        <p className="text-sm text-gray-500">Loading received orders…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-semibold text-gray-800">Failed to load orders</p>
        <p className="text-sm text-gray-500">{error}</p>
        <Button variant="primary" onClick={loadOrders} className="text-sm px-6">
          Try Again
        </Button>
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <>
      {rejectModal && (
        <RejectModal
          order={rejectModal}
          onConfirm={handleReject}
          onCancel={() => { if (!processing) setRejectModal(null); }}
          loading={processing === rejectModal._id}
        />
      )}

      <div className="flex flex-col gap-6">

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <HiOutlineClipboardList className="text-2xl text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Received Orders</h1>
              {pendingCount > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold
                                 px-2 py-0.5 rounded-full border border-yellow-200">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {orders.length} total order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link to={ROUTES.MY_CROPS} className="btn-secondary text-sm self-start sm:self-auto">
            ← My Crops
          </Link>
        </div>

        {/* ── Empty state ──────────────────────────────────────────── */}
        {orders.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
              <HiOutlineClipboardList className="text-4xl text-primary-300" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">No orders yet</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                When buyers place orders for your crops, they'll appear here.
              </p>
            </div>
            <Link to={ROUTES.MY_CROPS} className="btn-secondary text-sm">
              Manage My Crops
            </Link>
          </div>
        )}

        {/* ── Orders list ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const cropImg    = order.crop?.images?.[0]?.url || PLACEHOLDER;
            const location   = [order.crop?.location?.district, order.crop?.location?.state]
                                  .filter(Boolean).join(", ");
            const isProcessing = processing === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm
                           hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">

                  {/* Crop image */}
                  <div className="w-full h-36 sm:w-32 sm:h-auto bg-gray-100 shrink-0 overflow-hidden">
                    <img
                      src={cropImg}
                      alt={order.cropName}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col gap-2.5 min-w-0">

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{order.cropName}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          #{order._id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaBoxOpen className="text-gray-400" />
                        {order.orderedQuantity} {order.unit}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-primary-700">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      {location && (
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {location}
                        </span>
                      )}
                    </div>

                    {/* Buyer info */}
                    {order.buyer && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FaUser className="text-gray-400" />
                        <span>
                          Buyer:{" "}
                          <span className="font-semibold text-gray-700">
                            {order.buyer.name}
                          </span>
                          {order.buyer.phone && (
                            <span className="ml-2 text-gray-400">
                              · {order.buyer.phone}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Buyer note */}
                    {order.buyerNote && (
                      <div className="flex items-start gap-1.5 text-xs text-gray-500
                                      bg-blue-50 rounded-lg px-3 py-1.5">
                        <HiOutlineChatAlt className="text-blue-400 shrink-0 mt-0.5" />
                        <span className="italic">"{order.buyerNote}"</span>
                      </div>
                    )}

                    {/* Delivery address */}
                    {order.deliveryAddress?.city && (
                      <div className="text-xs text-gray-400 flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-gray-300" />
                        Deliver to: {[
                          order.deliveryAddress.street,
                          order.deliveryAddress.city,
                          order.deliveryAddress.state,
                          order.deliveryAddress.pincode,
                        ].filter(Boolean).join(", ")}
                      </div>
                    )}

                    {/* Transport info if accepted */}
                    {order.status === "accepted" && (
                      <div className="flex items-center gap-1.5 text-xs text-primary-700
                                      bg-primary-50 rounded-lg px-3 py-1.5 font-medium">
                        <FaTruck className="text-primary-500" />
                        Transport request created — awaiting transporter
                      </div>
                    )}
                    {order.status === "assigned" && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-700
                                      bg-blue-50 rounded-lg px-3 py-1.5 font-medium">
                        <FaTruck className="text-blue-500" />
                        Transporter assigned to this delivery
                      </div>
                    )}

                    {/* Action buttons — only for pending orders */}
                    {order.status === "pending" && (
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => handleAccept(order)}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                                     text-sm font-semibold rounded-xl transition-colors
                                     bg-primary-50 text-primary-700
                                     hover:bg-primary-600 hover:text-white
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <Spinner size="w-4 h-4" color="border-primary-600" />
                          ) : (
                            <HiOutlineCheck className="text-base" />
                          )}
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectModal(order)}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                                     text-sm font-semibold rounded-xl transition-colors
                                     bg-red-50 text-red-600
                                     hover:bg-red-600 hover:text-white
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <HiOutlineX className="text-base" />
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Farmer's rejection note */}
                    {order.status === "rejected" && order.farmerNote && (
                      <p className="text-xs text-gray-400 italic">
                        Your note: "{order.farmerNote}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ReceivedOrdersPage;
