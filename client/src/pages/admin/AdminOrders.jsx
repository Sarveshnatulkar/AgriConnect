import { useState, useEffect, useCallback } from "react";
import {
  HiOutlineSearch, HiX,
  HiChevronLeft, HiChevronRight, HiOutlineEye,
} from "react-icons/hi";
import { MdOutlineShoppingCart } from "react-icons/md";
import StatusBadge from "../../components/common/StatusBadge";
import { fetchAdminOrders } from "../../services/adminService";
import { formatDate, formatCurrency, getErrorMessage } from "../../utils/helpers";

/**
 * AdminOrders — view all orders, search by crop name, filter by status.
 * Route: /admin/orders
 */

const ORDER_STATUSES = ["pending","accepted","rejected","assigned","completed","cancelled"];

const PLACEHOLDER = "https://placehold.co/48x48/f0fdf4/16a34a?text=🌾";

// ── Order detail modal ────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose }) => {
  const addr = order.deliveryAddress;
  const addrStr = [addr?.street, addr?.city, addr?.state, addr?.pincode].filter(Boolean).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base">Order Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiX />
          </button>
        </div>

        {/* Crop */}
        <div className="flex items-center gap-3 bg-primary-50 rounded-xl p-4">
          <img src={order.crop?.images?.[0]?.url || PLACEHOLDER} alt={order.cropName}
            className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0"
            onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
          <div>
            <p className="font-bold text-gray-900">{order.cropName}</p>
            <p className="text-sm text-gray-500">{order.orderedQuantity} {order.unit}</p>
            <p className="font-semibold text-primary-700 text-sm">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Status:</span>
          <StatusBadge status={order.status} />
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-medium mb-1">Buyer</p>
            <p className="font-semibold text-gray-800">{order.buyer?.name || "—"}</p>
            <p className="text-xs text-gray-400">{order.buyer?.email}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-medium mb-1">Farmer</p>
            <p className="font-semibold text-gray-800">{order.farmer?.name || "—"}</p>
            <p className="text-xs text-gray-400">{order.farmer?.email}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-medium mb-1">Order Date</p>
            <p className="font-semibold text-gray-800">{formatDate(order.createdAt)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-medium mb-1">Price at Order</p>
            <p className="font-semibold text-gray-800">{formatCurrency(order.priceAtOrder)} / {order.unit}</p>
          </div>
        </div>

        {/* Notes */}
        {order.buyerNote && (
          <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700 italic">
            Buyer note: "{order.buyerNote}"
          </div>
        )}
        {order.farmerNote && (
          <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary-700 italic">
            Farmer note: "{order.farmerNote}"
          </div>
        )}

        {/* Delivery */}
        {addrStr && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-medium mb-1">Delivery Address</p>
            {addrStr}
          </div>
        )}

        <button onClick={onClose} className="btn-secondary text-sm w-full mt-1">Close</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const AdminOrders = () => {
  const [orders,     setOrders]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [status,     setStatus]     = useState("");
  const [page,       setPage]       = useState(1);
  const [detailOrder,setDetailOrder]= useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchAdminOrders({ search, status, page, limit: 15 });
      setOrders(res.data.orders);
      setPagination(res.pagination);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <MdOutlineShoppingCart className="text-2xl text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">
              {pagination ? `${pagination.totalResults} total orders` : ""}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="search" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by crop name…" className="input-field pl-9 text-sm" />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              aria-label="Filter by status"
              className="input-field appearance-none bg-white pr-8 text-sm cursor-pointer"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</div>
          </div>

          {(search || status) && (
            <button
              onClick={() => { setSearch(""); setStatus(""); setPage(1); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 rounded-lg transition-colors"
            >
              <HiX className="text-base" /> Clear
            </button>
          )}
        </div>

        {/* Loading — skeleton rows */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Order","Buyer","Farmer","Qty & Price","Status","Date",""].map((h, i) => (
                      <th key={i} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0" />
                          <div className="flex flex-col gap-1.5">
                            <div className="h-3.5 bg-gray-200 rounded w-24" />
                            <div className="h-3 bg-gray-100 rounded w-14" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><div className="flex flex-col gap-1.5"><div className="h-3.5 bg-gray-200 rounded w-20" /><div className="h-3 bg-gray-100 rounded w-28" /></div></td>
                      <td className="px-5 py-3.5"><div className="flex flex-col gap-1.5"><div className="h-3.5 bg-gray-200 rounded w-20" /><div className="h-3 bg-gray-100 rounded w-28" /></div></td>
                      <td className="px-5 py-3.5"><div className="flex flex-col gap-1.5"><div className="h-3.5 bg-gray-200 rounded w-16" /><div className="h-3 bg-gray-100 rounded w-12" /></div></td>
                      <td className="px-5 py-3.5"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
                      <td className="px-5 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-16" /></td>
                      <td className="px-5 py-3.5"><div className="w-8 h-8 rounded-lg bg-gray-100" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Order","Buyer","Farmer","Qty & Price","Status","Date",""].map((h, i) => (
                      <th key={i} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <MdOutlineShoppingCart className="text-3xl text-gray-300" />
                          </div>
                          <p className="font-semibold text-gray-600">No orders found</p>
                          <p className="text-sm text-gray-400">
                            {(search || status)
                              ? "Try adjusting your search or status filter."
                              : "No orders have been placed yet."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      {/* Crop */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={order.crop?.images?.[0]?.url || PLACEHOLDER}
                            alt={order.cropName}
                            className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0"
                            onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                          />
                          <div>
                            <p className="font-semibold text-gray-800 truncate max-w-32">{order.cropName}</p>
                            <p className="text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      {/* Buyer */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-700 font-medium">{order.buyer?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{order.buyer?.email}</p>
                      </td>
                      {/* Farmer */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-700 font-medium">{order.farmer?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{order.farmer?.email}</p>
                      </td>
                      {/* Qty & Amount */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-primary-700 tabular-nums">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-gray-400">{order.orderedQuantity} {order.unit}</p>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      {/* Date */}
                      <td className="px-5 py-3.5 text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setDetailOrder(order)}
                          title="View order details"
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <HiOutlineEye className="text-gray-600 text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalResults} orders
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                               hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiChevronLeft />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                               hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminOrders;
