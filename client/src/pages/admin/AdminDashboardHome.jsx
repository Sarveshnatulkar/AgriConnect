import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  MdOutlinePeople,
  MdOutlineAgriculture,
  MdOutlineShoppingCart,
  MdOutlineLocalShipping,
  MdOutlinePendingActions,
  MdOutlineCheckCircle,
  MdOutlineDirectionsBike,
} from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import Spinner from "../../components/common/Spinner";
import { fetchAdminStats } from "../../services/adminService";
import { ROUTES } from "../../utils/constants";
import { getErrorMessage, capitalise } from "../../utils/helpers";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

/**
 * AdminDashboardHome — stat cards + two charts.
 * Route: /admin
 */

const STAT_CARDS = (s) => [
  { label: "Total Users",       value: s.totalUsers,        icon: <FaUsers />,                     bg: "bg-blue-50",    text: "text-blue-600",   link: ROUTES.ADMIN_USERS },
  { label: "Farmers",           value: s.totalFarmers,      icon: <MdOutlineAgriculture />,         bg: "bg-primary-50", text: "text-primary-600",link: `${ROUTES.ADMIN_USERS}?role=farmer` },
  { label: "Buyers",            value: s.totalBuyers,       icon: <MdOutlinePeople />,              bg: "bg-purple-50",  text: "text-purple-600", link: `${ROUTES.ADMIN_USERS}?role=buyer` },
  { label: "Transporters",      value: s.totalTransporters, icon: <MdOutlineDirectionsBike />,      bg: "bg-orange-50",  text: "text-orange-600", link: `${ROUTES.ADMIN_USERS}?role=transporter` },
  { label: "Total Crops",       value: s.totalCrops,        icon: <MdOutlineAgriculture />,         bg: "bg-green-50",   text: "text-green-600",  link: ROUTES.ADMIN_CROPS },
  { label: "Active Orders",     value: s.activeOrders,      icon: <MdOutlinePendingActions />,      bg: "bg-yellow-50",  text: "text-yellow-600", link: ROUTES.ADMIN_ORDERS },
  { label: "Completed Orders",  value: s.completedOrders,   icon: <MdOutlineCheckCircle />,         bg: "bg-teal-50",    text: "text-teal-600",   link: `${ROUTES.ADMIN_ORDERS}?status=completed` },
  { label: "Pending Transport", value: s.pendingTransport,  icon: <MdOutlineLocalShipping />,       bg: "bg-red-50",     text: "text-red-600",    link: ROUTES.ADMIN_TRANSPORT },
];

// Chart colour palette
const ROLE_COLOURS  = ["#16a34a", "#2563eb", "#9333ea", "#ea580c"];
const STATUS_COLOURS = {
  pending:   "#f59e0b",
  accepted:  "#16a34a",
  rejected:  "#ef4444",
  assigned:  "#3b82f6",
  completed: "#14b8a6",
  cancelled: "#9ca3af",
};

const AdminDashboardHome = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchAdminStats()
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="w-10 h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  const { stats, charts } = data;

  // Users by role doughnut
  const userRoleChart = {
    labels:   charts.usersByRole.map((u) => capitalise(u.role || "Unknown")),
    datasets: [{
      data:            charts.usersByRole.map((u) => u.count),
      backgroundColor: ROLE_COLOURS,
      borderWidth:     2,
      borderColor:     "#fff",
    }],
  };

  // Orders by status bar
  const orderStatusChart = {
    labels:   charts.ordersByStatus.map((o) => capitalise(o.status || "Unknown")),
    datasets: [{
      label:           "Orders",
      data:            charts.ordersByStatus.map((o) => o.count),
      backgroundColor: charts.ordersByStatus.map((o) => STATUS_COLOURS[o.status] || "#9ca3af"),
      borderRadius:    6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { font: { size: 12 } } } },
  };

  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="flex flex-col gap-7">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform statistics at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CARDS(stats).map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className={`${card.bg} rounded-2xl p-5 flex flex-col gap-2
                        border border-transparent hover:shadow-md
                        hover:-translate-y-0.5 transition-all duration-150`}
          >
            <div className={`${card.text} text-2xl`}>{card.icon}</div>
            <p className="text-2xl font-extrabold text-gray-900 tabular-nums">
              {card.value?.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Users by Role — Doughnut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-base">Users by Role</h2>
          <div className="h-56">
            {charts.usersByRole.length > 0
              ? <Doughnut data={userRoleChart} options={chartOptions} />
              : <p className="text-sm text-gray-400 text-center pt-16">No data yet</p>
            }
          </div>
        </div>

        {/* Orders by Status — Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-base">Orders by Status</h2>
          <div className="h-56">
            {charts.ordersByStatus.length > 0
              ? <Bar data={orderStatusChart} options={barOptions} />
              : <p className="text-sm text-gray-400 text-center pt-16">No orders yet</p>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
