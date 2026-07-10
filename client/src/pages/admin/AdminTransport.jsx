import { useState, useEffect, useCallback } from "react";
import {
  HiX, HiChevronLeft, HiChevronRight,
  HiOutlineEye, HiOutlineCheck,
} from "react-icons/hi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import StatusBadge from "../../components/common/StatusBadge";
import { fetchAdminTransport, completeTransportRequest } from "../../services/adminService";
import { formatDate, formatCurrency, getErrorMessage } from "../../utils/helpers";

/**
 * AdminTransport — view all transport requests, filter by status,
 * view assigned transporter, mark request completed.
 * Route: /admin/transport
 */

const TRANSPORT_STATUSES = ["open", "assigned", "completed", "cancelled"];

const formatAddr = (addr) =>
  [addr?.village, addr?.district, addr?.state, addr?.city, addr?.pincode]
    .filter(Boolean).join(", ") || "—";

// ── Detail Modal ──────────────────────────────────────────────────────────────
const TransportDetailModal = ({ request, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in
                    flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-base">Transport Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><HiX /></button>
      </div>

      {/* Crop + Status */}
      <div className="bg-primary-50 rounded-xl p-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-gray-900">{request.cropName || "Crop Delivery"}</p>
          <p className="text-sm text-gray-500">{request.quantity} {request.unit}</p>
          {request.order?.totalAmount && (
            <p className="text-sm font-semibold text-primary-700">
              {formatCurrency(request.order.totalAmount)}
            </p>
          )}
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Route */}
      <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3 text-sm">
          <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <div className="w-0.5 h-6 bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div>
              <p className="text-xs text-gray-400 font-medium">Pickup (Farm)</p>
              <p className="font-semibold text-gray-800">{formatAddr(request.pickupAddress)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Dropoff (Buyer)</p>
              <p className="font-semibold text-gray-800">{formatAddr(request.dropoffAddress)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        {[
          { label: "Farmer",      person: request.farmer },
          { label: "Buyer",       person: request.buyer },
          { label: "Transporter", person: request.transporter },
        ].map(({ label, person }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
            {person ? (
              <>
                <p className="font-semibold text-gray-800">{person.name}</p>
                <p className="text-xs text-gray-400 truncate">{person.email}</p>
                {person.phone && <p className="text-xs text-gray-400">{person.phone}</p>}
              </>
            ) : (
              <p className="text-gray-400 italic">Not assigned</p>
            )}
          </div>
        ))}
      </div>

      {request.notes && (
        <div className="text-sm text-gray-600 bg-amber-50 rounded-xl p-3 italic">
          Note: "{request.notes}"
        </div>
      )}

      <div className="flex justify-between text-xs text-gray-400">
        <span>Created: {formatDate(request.createdAt)}</span>
        <span>ID: #{request._id.slice(-8).toUpperCase()}</span>
      </div>

      <button onClick={onClose} className="btn-secondary text-sm w-full">Close</button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const AdminTransport = () => {
  const [requests,   setRequests]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [status,     setStatus]     = useState("");
  const [page,       setPage]       = useState(1);
  const [actionId,   setActionId]   = useState(null);
  const [detailReq,  setDetailReq]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchAdminTransport({ status, page, limit: 15 });
      setRequests(res.data.requests);
      setPagination(res.pagination);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async (req) => {
    if (!window.confirm(`Mark transport for "${req.cropName}" as completed?`)) return;
    setActionId(req._id);
    try {
      const res = await completeTransportRequest(req._id);
      setRequests((prev) => prev.map((r) =>
        r._id === req._id ? { ...r, status: "completed" } : r
      ));
      toast.success(res.message || "Marked as completed");
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActionId(null); }
  };

  return (
    <>
      {detailReq && (
        <TransportDetailModal request={detailReq} onClose={() => setDetailReq(null)} />
      )}

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <MdOutlineLocalShipping className="text-2xl text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transport Requests</h1>
            <p className="text-sm text-gray-500">
              {pagination ? `${pagination.totalResults} total requests` : ""}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              aria-label="Filter by status"
              className="input-field appearance-none bg-white pr-8 text-sm cursor-pointer min-w-44"
            >
              <option value="">All Statuses</option>
              {TRANSPORT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</div>
          </div>

          {status && (
            <button
              onClick={() => { setStatus(""); setPage(1); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 rounded-lg transition-colors"
            >
              <HiX className="text-base" /> Clear
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-16"><Spinner size="w-9 h-9" /></div>
        )}

        {!loading && error && (
          <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Crop","Route","Farmer","Transporter","Status","Date","Actions"].map((h, i) => (
                      <th key={i} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                        No transport requests found
                      </td>
                    </tr>
                  ) : requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      {/* Crop */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-800 truncate max-w-32">
                          {req.cropName || "—"}
                        </p>
                        <p className="text-xs text-gray-400">{req.quantity} {req.unit}</p>
                        {req.order?.totalAmount && (
                          <p className="text-xs font-semibold text-primary-700">
                            {formatCurrency(req.order.totalAmount)}
                          </p>
                        )}
                      </td>

                      {/* Route */}
                      <td className="px-5 py-3.5 max-w-48">
                        <div className="flex items-start gap-1.5 text-xs text-gray-500">
                          <FaMapMarkerAlt className="text-primary-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="truncate">{formatAddr(req.pickupAddress)}</p>
                            <p className="text-gray-300 text-xs leading-none my-0.5">↓</p>
                            <p className="truncate">{formatAddr(req.dropoffAddress)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Farmer */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-700 font-medium">{req.farmer?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{req.farmer?.phone || req.farmer?.email || ""}</p>
                      </td>

                      {/* Transporter */}
                      <td className="px-5 py-3.5">
                        {req.transporter ? (
                          <>
                            <p className="text-sm text-gray-700 font-medium">{req.transporter.name}</p>
                            <p className="text-xs text-gray-400">{req.transporter.phone || req.transporter.email || ""}</p>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-xs text-gray-500">
                        {formatDate(req.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => setDetailReq(req)}
                            title="View details"
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          >
                            <HiOutlineEye className="text-gray-600 text-sm" />
                          </button>

                          {/* Mark Complete */}
                          {(req.status === "assigned") && (
                            <button
                              onClick={() => handleComplete(req)}
                              disabled={actionId === req._id}
                              title="Mark as completed"
                              className="w-8 h-8 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-700
                                         flex items-center justify-center transition-colors"
                            >
                              {actionId === req._id
                                ? <Spinner size="w-3.5 h-3.5" color="border-teal-600" />
                                : <HiOutlineCheck className="text-sm" />
                              }
                            </button>
                          )}
                        </div>
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
                  Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalResults} requests
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

export default AdminTransport;
