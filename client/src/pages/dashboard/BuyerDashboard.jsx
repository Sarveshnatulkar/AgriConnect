import { FaShoppingBasket, FaClipboardList, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";
import { getInitials } from "../../utils/helpers";

/**
 * BuyerDashboard — landing page for authenticated buyers.
 *
 * Phase 6 will replace placeholder stats with real API data.
 * Structure is final — only the data layer changes.
 */

const STAT_CARDS = [
  {
    icon:  <FaClipboardList className="text-2xl text-blue-500" />,
    label: "My Orders",
    value: "—",
    bg:    "bg-blue-50",
  },
  {
    icon:  <FaHeart className="text-2xl text-pink-500" />,
    label: "Wishlist",
    value: "—",
    bg:    "bg-pink-50",
  },
  {
    icon:  <FaShoppingBasket className="text-2xl text-accent-500" />,
    label: "Purchases",
    value: "—",
    bg:    "bg-orange-50",
  },
];

const BuyerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8 py-4">

      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div className="card flex items-center gap-4 bg-blue-50 border-blue-100">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
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

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.label}
            className={`card flex items-center gap-4 ${stat.bg} border-transparent`}
          >
            <div className="p-3 rounded-xl bg-white shadow-sm">
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.CROPS} className="btn-primary text-sm">
            Browse Marketplace
          </Link>
        </div>
      </div>

      {/* ── Recent Orders Placeholder ──────────────────────────────────── */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Orders</h2>
        <div className="text-center py-10 text-gray-400">
          <FaShoppingBasket className="text-4xl mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Your orders will appear here.</p>
          <p className="text-xs mt-1">Full data loads in Phase 6.</p>
        </div>
      </div>

    </div>
  );
};

export default BuyerDashboard;
