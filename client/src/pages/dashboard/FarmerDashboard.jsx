import { FaSeedling, FaClipboardList, FaMoneyBillWave } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";
import { getInitials } from "../../utils/helpers";

/**
 * FarmerDashboard — landing page for authenticated farmers.
 *
 * Currently shows a welcome card and placeholder stat cards.
 * Phase 5 will replace these placeholders with real data fetched from the API.
 * The layout and component structure are final — only the data changes.
 */

// Placeholder stats — replaced with API data in Phase 5
const STAT_CARDS = [
  {
    icon:  <FaSeedling className="text-2xl text-primary-500" />,
    label: "Active Listings",
    value: "—",
    bg:    "bg-primary-50",
  },
  {
    icon:  <FaClipboardList className="text-2xl text-blue-500" />,
    label: "Total Orders",
    value: "—",
    bg:    "bg-blue-50",
  },
  {
    icon:  <FaMoneyBillWave className="text-2xl text-accent-500" />,
    label: "Total Revenue",
    value: "—",
    bg:    "bg-orange-50",
  },
];

const FarmerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8 py-4">

      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div className="card flex items-center gap-4 bg-primary-50 border-primary-100">
        <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {getInitials(user.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your crop listings and track your orders from here.
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
          <Link to={ROUTES.CROP_CREATE} className="btn-primary text-sm">
            + Add New Crop
          </Link>
          <Link to={ROUTES.CROPS} className="btn-secondary text-sm">
            View Marketplace
          </Link>
        </div>
      </div>

      {/* ── Recent Listings Placeholder ────────────────────────────────── */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Listings</h2>
        <div className="text-center py-10 text-gray-400">
          <FaSeedling className="text-4xl mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Your crop listings will appear here.</p>
          <p className="text-xs mt-1">Full data loads in Phase 5.</p>
        </div>
      </div>

    </div>
  );
};

export default FarmerDashboard;
