import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  MdOutlineDashboard,
  MdOutlinePeople,
  MdOutlineAgriculture,
  MdOutlineShoppingCart,
  MdOutlineLocalShipping,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { HiOutlineLogout } from "react-icons/hi";
import useAuth from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";
import { getInitials } from "../../utils/helpers";

/**
 * AdminLayout — full-screen sidebar layout used exclusively for admin pages.
 * Does NOT use MainLayout (no public Navbar/Footer).
 *
 * Sidebar collapses to an icon-only rail on md screens and a drawer on mobile.
 * The <Outlet /> renders the active admin page in the main content area.
 */

const NAV_ITEMS = [
  { to: ROUTES.ADMIN_DASHBOARD, icon: <MdOutlineDashboard className="text-xl" />,     label: "Dashboard",  end: true },
  { to: ROUTES.ADMIN_USERS,     icon: <MdOutlinePeople className="text-xl" />,         label: "Users" },
  { to: ROUTES.ADMIN_CROPS,     icon: <MdOutlineAgriculture className="text-xl" />,    label: "Crops" },
  { to: ROUTES.ADMIN_ORDERS,    icon: <MdOutlineShoppingCart className="text-xl" />,   label: "Orders" },
  { to: ROUTES.ADMIN_TRANSPORT, icon: <MdOutlineLocalShipping className="text-xl" />,  label: "Transport" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
    ${isActive
      ? "bg-primary-600 text-white shadow-sm"
      : "text-gray-400 hover:bg-white/10 hover:text-white"
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
          <MdOutlineAgriculture className="text-white text-lg" />
        </div>
        <div>
          <p className="font-bold text-white text-base leading-none">AgriConnect</p>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                     text-sm font-medium text-red-400 hover:bg-red-500/10
                     hover:text-red-300 transition-colors"
        >
          <HiOutlineLogout className="text-xl" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 bg-gray-900 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Drawer ─────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 z-50 flex flex-col md:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 bg-white border-b border-gray-200 px-4 h-14 shrink-0 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <MdMenu className="text-2xl" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center">
              <MdOutlineAgriculture className="text-white text-sm" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              Agri<span className="text-primary-600">Connect</span> Admin
            </span>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
