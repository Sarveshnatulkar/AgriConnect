import { useState, useEffect, useCallback } from "react";
import { FaTruck, FaMapMarkerAlt, FaBoxOpen, FaUser } from "react-icons/fa";
import {
  HiOutlineTruck,
  HiOutlineClipboardList,
  HiOutlineCheck,
} from "react-icons/hi";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import {
  fetchAvailableRequests,
  fetchMyAssignments,
  acceptTransportRequest,
} from "../../services/transportService";
import { formatCurrency, formatDate, getErrorMessage } from "../../utils/helpers";
import useAuth from "../../hooks/useAuth";
import { getInitials } from "../../utils/helpers";

/**
 * TransportDashboard — landing page for authenticated transporters.
 *
 * Route:  /dashboard/transporter
 * Access: Transporter only
 *
 * Two tabs:
 *   Available  — open transport requests any transporter can claim
 *   My Jobs    — requests already assigned to this transporter
 *
 * Accepting a request:
 *   1. Calls PATCH /api/v1/transport/:id/accept
 *   2. Request moves from Available → My Jobs instantly (optimistic UI)
 *   3. Linked order status → "assigned" (backend handles this)
 */

const PLACEHOLDER = "https://placehold.co/60x60/f0fdf4/16a34a?text=🌾";

// ── Tab enum ──────────────────────────────────────────────────────────────────
const TABS = { AVAILABLE: "available", MY_JOBS: "myjobs" };

// ── Address string helper ─────────────────────────────────────────────────────
const formatAddress = (addr) => {
  if (!addr) return "—";
  return [addr.village, addr.district, addr.state, addr.city, addr.pincode]
    .filter(Boolean)
    .join(", ") || "—";
};

// ── Request card ──────────────────────────────────────────────────────────────
const RequestCard = ({ request, onAccept, accepting, isMyJob }) => {
  const pickup  = formatAddress(request.pickupAddress);
  const dropoff = formatAddress(request.dropoffAddress);
  const isAccepting = accepting === request._id;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                    hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-5 flex flex-col gap-3">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              {request.cropName || "Crop Delivery"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              #{request._id.slice(-8).toUpperCase()} · {formatDate(request.createdAt)}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Quantity + value */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FaBoxOpen className="text-gray-400" />
            {request.quantity} {request.unit}
          </span>
          {request.order?.totalAmount && (
            <span className="flex items-center gap-1 font-semibold text-primary-700">
              Order value: {formatCurrency(request.order.totalAmount)}
            </span>
          )}
        </div>

        {/* Route: pickup → dropoff */}
        <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-start gap-2 text-xs">
            <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              <div className="w-0.5 h-4 bg-gray-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div>
                <p className="text-gray-400 font-medium">Pickup (Farm)</p>
                <p className="text-gray-700 font-semibold truncate">{pickup}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Dropoff (Buyer)</p>
                <p className="text-gray-700 font-semibold truncate">{dropoff}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          {request.farmer && (
            <span className="flex items-center gap-1">
              <FaUser className="text-primary-400" />
              Farmer: <span className="font-medium text-gray-700 ml-0.5">{request.farmer.name}</span>
            </span>
          )}
          {request.buyer && (
            <span className="flex items-center gap-1">
              <FaUser className="text-blue-400" />
              Buyer: <span className="font-medium text-gray-700 ml-0.5">{request.buyer.name}</span>
            </span>
          )}
        </div>

        {/* Notes */}
        {request.notes && (
          <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-1.5">
            "{request.notes}"
          </p>
        )}

        {/* Accept button — only for available requests */}
        {!isMyJob && request.status === "open" && (
          <button
            type="button"
            onClick={() => onAccept(request._id)}
            disabled={isAccepting}
            className="w-full flex items-center justify-center gap-2 py-2.5
                       text-sm font-semibold rounded-xl transition-colors
                       bg-primary-50 text-primary-700
                       hover:bg-primary-600 hover:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAccepting ? (
              <Spinner size="w-4 h-4" color="border-primary-600" />
            ) : (
              <HiOutlineCheck className="text-base" />
            )}
            Accept Delivery
          </button>
        )}

        {/* My job status info */}
        {isMyJob && (
          <div className="flex items-center gap-1.5 text-xs text-blue-700
                          bg-blue-50 rounded-lg px-3 py-1.5 font-medium">
            <FaTruck className="text-blue-500" />
            You are assigned to this delivery
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const TransportDashboard = () => {
  const { user } = useAuth();
  const [tab,        setTab]       = useState(TABS.AVAILABLE);
  const [available,  setAvailable] = useState([]);
  const [myJobs,     setMyJobs]    = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState(null);
  const [accepting,  setAccepting] = useState(null); // request._id being accepted

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [availRes, myRes] = await Promise.all([
        fetchAvailableRequests(),
        fetchMyAssignments(),
      ]);
      setAvailable(availRes.data.requests);
      setMyJobs(myRes.data.requests);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAccept = async (requestId) => {
    setAccepting(requestId);
    try {
      const res = await acceptTransportRequest(requestId);
      const accepted = res.data.request;
      // Optimistic update: move from available → my jobs
      setAvailable((prev) => prev.filter((r) => r._id !== requestId));
      setMyJobs((prev) => [accepted, ...prev]);
      setTab(TABS.MY_JOBS);
      toast.success("Delivery accepted! You are now assigned.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAccepting(null);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Spinner size="w-10 h-10" />
        <p className="text-sm text-gray-500">Loading transport requests…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-semibold text-gray-800">Failed to load data</p>
        <p className="text-sm text-gray-500">{error}</p>
        <Button variant="primary" onClick={loadData} className="text-sm px-6">
          Try Again
        </Button>
      </div>
    );
  }

  const currentList = tab === TABS.AVAILABLE ? available : myJobs;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Welcome banner ───────────────────────────────────────────── */}
      <div className="card flex items-center gap-4 bg-blue-50 border-blue-100">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center
                        justify-center text-white text-xl font-bold shrink-0">
          {getInitials(user.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.name.split(" ")[0]} 🚛
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {available.length} available request{available.length !== 1 ? "s" : ""}
            {myJobs.length > 0 && ` · ${myJobs.length} active assignment${myJobs.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab(TABS.AVAILABLE)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                      text-sm font-semibold rounded-lg transition-all duration-150
                      ${tab === TABS.AVAILABLE
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
        >
          <HiOutlineTruck className="text-base" />
          Available
          {available.length > 0 && (
            <span className="bg-primary-600 text-white text-xs font-bold
                             px-1.5 py-0.5 rounded-full">
              {available.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab(TABS.MY_JOBS)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                      text-sm font-semibold rounded-lg transition-all duration-150
                      ${tab === TABS.MY_JOBS
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
        >
          <HiOutlineClipboardList className="text-base" />
          My Jobs
          {myJobs.length > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold
                             px-1.5 py-0.5 rounded-full">
              {myJobs.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {currentList.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <FaTruck className="text-4xl text-gray-300" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">
              {tab === TABS.AVAILABLE
                ? "No available requests"
                : "No jobs assigned yet"}
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              {tab === TABS.AVAILABLE
                ? "Check back soon — transport requests appear here when farmers accept orders."
                : "Accept a delivery from the Available tab to see it here."}
            </p>
          </div>
          {tab === TABS.MY_JOBS && (
            <button
              type="button"
              onClick={() => setTab(TABS.AVAILABLE)}
              className="btn-primary text-sm"
            >
              Browse Available Requests
            </button>
          )}
        </div>
      )}

      {/* ── Request cards ────────────────────────────────────────────── */}
      {currentList.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {currentList.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onAccept={handleAccept}
              accepting={accepting}
              isMyJob={tab === TABS.MY_JOBS}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TransportDashboard;
