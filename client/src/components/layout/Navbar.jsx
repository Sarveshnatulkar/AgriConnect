import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import { MdOutlineAgriculture } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import { ROUTES, ROLE_DASHBOARD } from "../../utils/constants";
import { getInitials, capitalise } from "../../utils/helpers";

/**
 * Navbar — top navigation bar.
 *
 * Behaviour:
 *  - Shows logo and public links when not authenticated.
 *  - Shows role-aware navigation links when authenticated.
 *  - Shows user avatar initials and a logout button when authenticated.
 *  - Collapses to a hamburger menu on mobile (responsive).
 *
 * Uses NavLink (not Link) for nav items so the active route gets
 * the `aria-current="page"` attribute and active styling automatically.
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const dashboardPath = user ? ROLE_DASHBOARD[user.role] : ROUTES.HOME;

  // Active link style helper
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-primary-600 font-semibold border-b-2 border-primary-500 pb-0.5"
      : "text-gray-600 hover:text-primary-600 transition-colors";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link
            to={isAuthenticated ? dashboardPath : ROUTES.HOME}
            className="flex items-center gap-2 font-bold text-xl text-primary-700"
          >
            <MdOutlineAgriculture className="text-2xl text-primary-600" />
            <span>AgriConnect</span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {!isAuthenticated ? (
              <>
                <NavLink to={ROUTES.HOME}     className={linkClass}>Home</NavLink>
                <NavLink to={ROUTES.LOGIN}    className={linkClass}>Login</NavLink>
                <NavLink to={ROUTES.REGISTER} className={linkClass}>
                  <span className="btn-primary text-sm py-1.5 px-4">Register</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to={dashboardPath} className={linkClass}>Dashboard</NavLink>
                <NavLink to={ROUTES.CROPS}  className={linkClass}>Marketplace</NavLink>

                {/* User avatar + role badge */}
                <div className="flex items-center gap-3 ml-2">
                  <button
                    onClick={() => navigate(dashboardPath)}
                    className="flex items-center gap-2 group"
                    aria-label="Go to dashboard"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(user.name)}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-medium text-gray-800 leading-none">
                        {user.name.split(" ")[0]}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {capitalise(user.role)}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors ml-1"
                    aria-label="Log out"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </nav>

          {/* ── Mobile Hamburger ──────────────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <HiX className="text-2xl" />
            ) : (
              <HiOutlineMenuAlt3 className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          {!isAuthenticated ? (
            <>
              <NavLink to={ROUTES.HOME}     className={linkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
              <NavLink to={ROUTES.LOGIN}    className={linkClass} onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to={ROUTES.REGISTER} className={linkClass} onClick={() => setMenuOpen(false)}>Register</NavLink>
            </>
          ) : (
            <>
              <NavLink to={dashboardPath} className={linkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to={ROUTES.CROPS}  className={linkClass} onClick={() => setMenuOpen(false)}>Marketplace</NavLink>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 font-medium"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
