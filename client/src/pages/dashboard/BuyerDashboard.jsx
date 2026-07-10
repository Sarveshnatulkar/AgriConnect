import { useState, useEffect } from "react";
import { FaShoppingBasket, FaClipboardList, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useWishlist from "../../hooks/useWishlist";
import { ROUTES } from "../../utils/constants";
import { getInitials } from "../../utils/helpers";
import { fetchMyOrders } from "../../services/orderService";

/**
 * BuyerDashboard — landing page for authenticated buyers.
 * Shows live order count, wishlist count, and quick action links.
 */
const BuyerDashboard = () => {
  const { user }              = useAuth();
  const { count: wishlistCount } = useWishlist();

  const [orderCount,  setOrderCount]  = useState("—");
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch order count for stat card
  useEffect(() => {
    fetchMyOrders()
      .then((res) => setOrderCount(res.data.orders.length))
      .catch(() => setOrderCount("—"))
      .finally(() => setLoadingStats(false));
  }, []);

  const STAT_CARDS = [
    {
      icon:   <FaClipboardList className="text-2xl text-blue-500" />,
      label:  "My Orders",
      value:  loadingStats ? "…" : orderCount,
      bg:     "bg-blue-50",
      link:   ROUTES.MY_ORDERS,
    },
    {
      icon:   <FaHeart className="text-2xl text-pink-500" />,
      label:  "Wishlist",
      value:  wishlistCount,
      bg:     "bg-pink-50",
      link:   ROUTES.WISHLIST,
    },
    {
      icon:   <FaShoppingBasket className="text-2xl text-accent-500" />,
      label:  "Marketplace",
      value:  "Browse",
      bg:     "bg-orange-50",
      link:   ROUTES.CROPS,
    },
  ];

  return (
    <div className="flex flex-col gap-8 py-4">

      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div className="card flex items-center gap-4 bg-blue-50 border-blue-100">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center
                        justify-center text-white text-xl font-bold shrink-0">
          {getInitials(user.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Browse fresh crops and manage your orders from here.
          </p>
        </div>
      </div>

      {/* ── Stat Cards (clickable) ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STAT_CARDS.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className={`card flex items-center gap-4 ${stat.bg} border-transparent
                        hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`}
          >
            <div className="p-3 rounded-xl bg-white shadow-sm shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.CROPS}     className="btn-primary text-sm">
            Browse Marketplace
          </Link>
          <Link to={ROUTES.MY_ORDERS} className="btn-secondary text-sm">
            My Orders
          </Link>
          <Link to={ROUTES.WISHLIST}  className="btn-secondary text-sm">
            Wishlist
          </Link>
        </div>
      </div>

      {/* ── Recent Orders ──────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link to={ROUTES.MY_ORDERS}
                className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="text-center py-8 text-gray-400">
          <FaShoppingBasket className="text-4xl mx-auto mb-3 text-gray-200" />
          <p className="text-sm">
            <Link to={ROUTES.MY_ORDERS}
                  className="text-primary-600 hover:underline">
              View your orders
            </Link>{" "}
            to see full order history and status.
          </p>
        </div>
      </div>

    </div>
  );
};

export default BuyerDashboard;
