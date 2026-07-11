import { useState, useEffect } from "react";
import {
  FaSeedling, FaClipboardList, FaMoneyBillWave,
  FaCheckCircle, FaTimesCircle, FaBoxOpen,
} from "react-icons/fa";
import {
  HiOutlineUser, HiOutlinePencilAlt,
  HiOutlinePlusCircle, HiOutlineClipboardList,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";
import { getInitials, formatCurrency, formatDate, capitalise } from "../../utils/helpers";
import { fetchMyCrops } from "../../services/cropService";
import { fetchReceivedOrders } from "../../services/orderService";
import StatusBadge from "../../components/common/StatusBadge";

/**
 * FarmerDashboard — improved with live stats, skeleton loaders,
 * recent orders preview, and profile link.
 *
 * Live data:
 *  - Active listings count  → fetched from GET /crops, filtered by owner + isAvailable
 *  - Total received orders  → fetched from GET /orders/received
 *  - Pending orders count   → derived from orders
 *  - Recent 3 orders        → shown inline with StatusBadge
 */

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonStatCard = () => (
  <div className="card flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
    <div className="flex flex-col gap-2 flex-1">
      <div className="h-6 bg-gray-200 rounded w-16" />
      <div className="h-3 bg-gray-100 rounded w-24" />
    </div>
  </div>
);

const SkeletonOrderRow = () => (
  <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
    <div className="flex-1 flex flex-col gap-1.5">
      <div className="h-3.5 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
    <div className="h-6 w-16 bg-gray-100 rounded-full" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const FarmerDashboard = () => {
  const { user } = useAuth();

  const [cropsData,  setCropsData]  = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [cropsRes, ordersRes] = await Promise.allSettled([
          fetchMyCrops(),
          fetchReceivedOrders(),
        ]);

        if (cropsRes.status === "fulfilled") {
          setCropsData(cropsRes.value.data.crops);
        }

        if (ordersRes.status === "fulfilled") {
          setOrdersData(ordersRes.value.data.orders);
        }
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const activeListings = cropsData
    ? cropsData.filter((c) => c.isAvailable).length
    : null;

  const totalOrders = ordersData?.length ?? null;

  const pendingOrders = ordersData
    ? ordersData.filter((o) => o.status === "pending").length
    : null;

  const totalRevenue = ordersData
    ? ordersData
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    : null;

  const recentOrders = ordersData ? ordersData.slice(0, 4) : [];

  const PLACEHOLDER_IMG = "https://placehold.co/40x40/f0fdf4/16a34a?text=🌾";

  return (
    <div className="flex flex-col gap-8 py-4">

      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div className="card flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-r from-primary-50 to-white border-primary-100">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar with live photo if set */}
          {user.avatar ? (
            <img src={user.avatar} alt={user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center
                            text-white text-xl font-bold shrink-0 shadow-sm">
              {getInitials(user.name)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              Welcome, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your crop listings and track your orders from here.
            </p>
            <span className="inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full
                             bg-primary-100 text-primary-700">
              {capitalise(user.role)}
            </span>
          </div>
        </div>

        {/* Profile shortcut */}
        <Link
          to={ROUTES.PROFILE}
          className="flex items-center gap-1.5 text-sm text-primary-600 font-medium
                     hover:text-primary-700 transition-colors self-start sm:self-center shrink-0"
        >
          <HiOutlineUser className="text-base" />
          Edit Profile
        </Link>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <Link to={ROUTES.MY_CROPS}
              className="card flex items-center gap-3 bg-primary-50 border-transparent
                         hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
              <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0">
                <FaSeedling className="text-xl text-primary-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 tabular-nums">
                  {activeListings ?? "—"}
                </p>
                <p className="text-xs text-gray-500">Active Listings</p>
              </div>
            </Link>

            <Link to={ROUTES.RECEIVED_ORDERS}
              className="card flex items-center gap-3 bg-blue-50 border-transparent
                         hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
              <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0">
                <FaClipboardList className="text-xl text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 tabular-nums">
                  {totalOrders ?? "—"}
                </p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </Link>

            <Link to={`${ROUTES.RECEIVED_ORDERS}?status=pending`}
              className="card flex items-center gap-3 bg-yellow-50 border-transparent
                         hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
              <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0">
                <HiOutlineClipboardList className="text-xl text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 tabular-nums">
                  {pendingOrders ?? "—"}
                </p>
                <p className="text-xs text-gray-500">Pending Orders</p>
              </div>
            </Link>

            <div className="card flex items-center gap-3 bg-orange-50 border-transparent">
              <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0">
                <FaMoneyBillWave className="text-xl text-orange-500" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-gray-900 tabular-nums leading-tight">
                  {totalRevenue !== null ? formatCurrency(totalRevenue) : "—"}
                </p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.CROP_CREATE}
            className="btn-primary text-sm flex items-center gap-1.5">
            <HiOutlinePlusCircle className="text-base" />
            Add New Crop
          </Link>
          <Link to={ROUTES.MY_CROPS}        className="btn-secondary text-sm">My Listings</Link>
          <Link to={ROUTES.RECEIVED_ORDERS} className="btn-secondary text-sm">Received Orders</Link>
          <Link to={ROUTES.CROPS}           className="btn-secondary text-sm">Marketplace</Link>
          <Link to={ROUTES.PROFILE}
            className="btn-secondary text-sm flex items-center gap-1.5">
            <HiOutlinePencilAlt className="text-base" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* ── Recent Received Orders ─────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link to={ROUTES.RECEIVED_ORDERS}
                className="text-sm text-primary-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div>
            <SkeletonOrderRow />
            <SkeletonOrderRow />
            <SkeletonOrderRow />
          </div>
        )}

        {/* Empty state */}
        {!loading && recentOrders.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <FaSeedling className="text-2xl text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">No orders yet</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Orders from buyers will appear here once they place them.
              </p>
            </div>
            <Link to={ROUTES.MY_CROPS} className="btn-secondary text-sm mt-1">
              Manage My Crops
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && recentOrders.length > 0 && (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const cropImg = order.crop?.images?.[0]?.url || PLACEHOLDER_IMG;
              return (
                <div key={order._id}
                  className="flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors rounded-lg px-1 -mx-1">
                  <img src={cropImg} alt={order.cropName}
                    className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{order.cropName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span>{order.buyer?.name || "Unknown buyer"}</span>
                      <span>·</span>
                      <span>{order.orderedQuantity} {order.unit}</span>
                      <span>·</span>
                      <span className="font-medium text-primary-700">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={order.status} />
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── My Crop Listings preview ───────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">My Listings</h2>
          <Link to={ROUTES.MY_CROPS}
                className="text-sm text-primary-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />
            ))}
          </div>
        )}

        {!loading && (!cropsData || cropsData.length === 0) && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
              <FaBoxOpen className="text-xl text-primary-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">No listings yet</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Add your first crop to start selling.
              </p>
            </div>
            <Link to={ROUTES.CROP_CREATE} className="btn-primary text-sm mt-1 flex items-center gap-1.5">
              <HiOutlinePlusCircle className="text-base" />
              Add Crop
            </Link>
          </div>
        )}

        {!loading && cropsData && cropsData.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cropsData.slice(0, 4).map((crop) => {
              const img = crop.images?.[0]?.url || PLACEHOLDER_IMG;
              return (
                <div key={crop._id}
                  className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square group">
                  <img src={img} alt={crop.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
                                  flex flex-col justify-end p-2">
                    <p className="text-white text-xs font-semibold truncate">{crop.cropName}</p>
                    <p className="text-white/70 text-xs">{formatCurrency(crop.price)}/{crop.unit}</p>
                  </div>
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5
                                    rounded-full ${crop.isAvailable
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-500 text-white"
                                    }`}>
                    {crop.isAvailable ? "Live" : "Off"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default FarmerDashboard;
