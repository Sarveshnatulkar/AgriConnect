import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { HiOutlineShoppingCart, HiOutlineX } from "react-icons/hi";
import { FaBoxOpen, FaMapMarkerAlt, FaLeaf } from "react-icons/fa";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import { fetchMyOrders, cancelOrder } from "../../services/orderService";
import { formatCurrency, formatDate, getErrorMessage } from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";

/**
 * MyOrdersPage — buyer view of all their placed orders.
 *
 * Route:  /orders/my
 * Access: Buyer only
 *
 * Features:
 *  - Lists all orders newest first
 *  - Shows status badge (Pending / Accepted / Rejected / Assigned / Completed / Cancelled)
 *  - Cancel button for pending orders with inline confirmation
 *  - Loading / error / empty states
 */

const PLACEHOLDER = "https://placehold.co/80x80/f0fdf4/16a34a?text=🌾";

// ── Status progression stepper ────────────────────────────────────────────────
const STEPS = ["pending", "accepted", "assigned", "completed"];

const OrderStepper = ({ status }) => {
  if (status === "rejected" || status === "cancelled") return null;
  const currentIdx = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-3">
      {STEPS.map((step, i) => {
        const done    = i <= currentIdx;
        const active  = i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center
                             text-xs font-bold border-2 shrink-0
                             ${done
                               ? "bg-primary-600 border-primary-600 text-white"
                               : "bg-white border-gray-300 text-gray-400"
                             }
                             ${active ? "ring-2 ring-primary-200" : ""}`}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < currentIdx ? "bg-primary-500" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const MyOrdersPage = () => {
  const [orders,       setOrders]      = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState(null);
  const [cancelling,   setCancelling]  = useState(null); // order._id being cancelled

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyOrders();
      setOrders(res.data.orders);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleCancel = async (order) => {
    if (!window.confirm(`Cancel your order for "${order.cropName}"?`)) return;
    setCancelling(order._id);
    try {
      await cancelOrder(order._id);
      setOrders((prev) =>
        prev.map((o) => o._id === order._id ? { ...o, status: "cancelled" } : o)
      );
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(null);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Spinner size="w-10 h-10" />
        <p className="text-sm text-gray-500">Loading your orders…</p>
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

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <HiOutlineShoppingCart className="text-2xl text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
            <HiOutlineShoppingCart className="text-4xl text-primary-300" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">No orders yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Browse the marketplace and place your first order.
            </p>
          </div>
          <Link to={ROUTES.CROPS} className="btn-primary text-sm">
            Browse Marketplace
          </Link>
        </div>
      )}

      {/* Orders list */}
      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const cropImg  = order.crop?.images?.[0]?.url || PLACEHOLDER;
          const location = [order.crop?.location?.district, order.crop?.location?.state]
                             .filter(Boolean).join(", ");
          const isCancelling = cancelling === order._id;

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
                <div className="flex-1 p-5 flex flex-col gap-2 min-w-0">

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{order.cropName}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Order #{order._id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <FaBoxOpen className="text-gray-400" />
                      {order.orderedQuantity} {order.unit}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary-700">
                      Total: {formatCurrency(order.totalAmount)}
                    </span>
                    {location && (
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {location}
                      </span>
                    )}
                  </div>

                  {/* Seller info */}
                  {order.farmer && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FaLeaf className="text-primary-400" />
                      <span>Seller: <span className="font-medium text-gray-700">{order.farmer.name}</span></span>
                    </div>
                  )}

                  {/* Farmer note */}
                  {order.farmerNote && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5 italic">
                      Farmer: "{order.farmerNote}"
                    </p>
                  )}

                  {/* Order progress stepper */}
                  <OrderStepper status={order.status} />

                  {/* Cancel button */}
                  {order.status === "pending" && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => handleCancel(order)}
                        disabled={isCancelling}
                        className="flex items-center gap-1.5 text-xs text-red-500
                                   font-medium hover:text-red-700 transition-colors
                                   disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <Spinner size="w-3 h-3" color="border-red-400" />
                        ) : (
                          <HiOutlineX className="text-sm" />
                        )}
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrdersPage;
