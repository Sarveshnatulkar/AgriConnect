import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  HiOutlineMenuAlt3,
  HiX,
  HiChevronDown,
  HiOutlineLogout,
  HiOutlineViewGrid,
  HiOutlineUser,
  HiOutlineHeart,
  HiHeart,
} from "react-icons/hi";
import { MdOutlineAgriculture } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import useWishlist from "../../hooks/useWishlist";
import { ROUTES, ROLE_DASHBOARD } from "../../utils/constants";
import { getInitials, capitalise } from "../../utils/helpers";

/**
 * Navbar — sticky top navigation bar.
 *
 * Desktop layout (≥ md):
 *   [Logo]  [Home] [Marketplace] [Dashboard?]  ...  [Login] [Register]
 *                                                or
 *   [Logo]  [Home] [Marketplace] [Dashboard]   ...  [Avatar ▾ dropdown]
 *
 * Mobile layout (< md):
 *   [Logo]  [☰ Hamburger]
 *   ↓ slide-down panel with all links + user row
 *
 * Profile dropdown (authenticated, desktop):
 *   - Avatar circle with initials
 *   - Name + role badge
 *   - "My Dashboard" link
 *   - "Profile Settings" link  (placeholder for later phases)
 *   - Divider
 *   - "Logout" button (red)
 *   Closes on: outside click, Escape key, or any item click
 *
 * Accessibility:
 *   - aria-expanded on hamburger and dropdown toggles
 *   - aria-haspopup="true" on dropdown button
 *   - role="menu" + role="menuitem" on dropdown list
 *   - NavLink sets aria-current="page" automatically
 */

// ─── Shared NavLink active/inactive class ─────────────────────────────────────
const navLinkClass = ({ isActive }) =>
  isActive
    ? "text-primary-600 font-semibold relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-primary-500 after:rounded-full"
    : "text-gray-600 hover:text-primary-700 transition-colors duration-150 relative";

// ─── Role colour pill ─────────────────────────────────────────────────────────
const ROLE_COLOURS = {
  farmer:      "bg-primary-100 text-primary-700",
  buyer:       "bg-blue-100   text-blue-700",
  transporter: "bg-yellow-100 text-yellow-700",
  admin:       "bg-purple-100 text-purple-700",
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const dashboardPath = user ? ROLE_DASHBOARD[user.role] : ROUTES.HOME;

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown",   handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown",   handleEscape);
    };
  }, []);

  // ── Close mobile menu on route change ────────────────────────────────────
  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 group"
            aria-label="AgriConnect home"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm group-hover:bg-primary-700 transition-colors">
              <MdOutlineAgriculture className="text-white text-lg" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Agri<span className="text-primary-600">Connect</span>
            </span>
          </Link>

          {/* ── Desktop Navigation ─────────────────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium"
            aria-label="Main navigation"
          >
            <NavLink to={ROUTES.HOME}  className={navLinkClass}>Home</NavLink>
            <NavLink to={ROUTES.CROPS} className={navLinkClass}>Marketplace</NavLink>

            {isAuthenticated && (
              <>
                {/* Wishlist icon with count badge */}
                <NavLink
                  to={ROUTES.WISHLIST}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1 transition-colors duration-150
                    ${isActive ? "text-red-500" : "text-gray-600 hover:text-red-500"}`
                  }
                  aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
                >
                  {({ isActive }) => (
                    <>
                      {isActive || wishlistCount > 0
                        ? <HiHeart className="text-xl text-red-500" />
                        : <HiOutlineHeart className="text-xl" />
                      }
                      {wishlistCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full
                                         bg-red-500 text-white text-[10px] font-bold
                                         flex items-center justify-center leading-none">
                          {wishlistCount > 9 ? "9+" : wishlistCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>

                <NavLink to={dashboardPath} className={navLinkClass}>
                  Dashboard
                </NavLink>
              </>
            )}
          </nav>

          {/* ── Desktop Right Side ─────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">

            {/* Unauthenticated */}
            {!isAuthenticated ? (
              <>
                <NavLink
                  to={ROUTES.LOGIN}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors px-2"
                >
                  Login
                </NavLink>
                <Link
                  to={ROUTES.REGISTER}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Register
                </Link>
              </>
            ) : (
              /* ── Profile Dropdown ──────────────────────────────────── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-label="Open user menu"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {getInitials(user.name)}
                  </div>
                  {/* Name + role */}
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-gray-800 leading-none">
                      {user.name.split(" ")[0]}
                    </p>
                    <p className={`text-xs font-medium mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${ROLE_COLOURS[user.role] || "bg-gray-100 text-gray-600"}`}>
                      {capitalise(user.role)}
                    </p>
                  </div>
                  <HiChevronDown
                    className={`text-gray-400 text-lg transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div
                    role="menu"
                    aria-label="User menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-fade-in"
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        role="menuitem"
                        onClick={() => { navigate(dashboardPath); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <HiOutlineViewGrid className="text-lg text-gray-400 shrink-0" />
                        My Dashboard
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => { navigate(`/profile`); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <HiOutlineUser className="text-lg text-gray-400 shrink-0" />
                        Profile Settings
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                      >
                        <HiOutlineLogout className="text-lg shrink-0" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Mobile: Hamburger button ────────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen
              ? <HiX className="text-2xl" />
              : <HiOutlineMenuAlt3 className="text-2xl" />
            }
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Panel ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-md">
          <nav className="flex flex-col px-4 pt-3 pb-4 gap-0.5" aria-label="Mobile navigation">

            <NavLink
              to={ROUTES.HOME}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to={ROUTES.CROPS}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Marketplace
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to={ROUTES.WISHLIST}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <span className="flex items-center gap-2 flex-1">
                    <HiOutlineHeart className="text-base text-red-400" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold
                                       px-1.5 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                </NavLink>

                <NavLink
                  to={dashboardPath}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              </>
            )}

            {/* Auth section */}
            <div className="mt-2 pt-3 border-t border-gray-100">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <NavLink
                    to={ROUTES.LOGIN}
                    onClick={closeMobile}
                    className="btn-secondary text-sm text-center"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to={ROUTES.REGISTER}
                    onClick={closeMobile}
                    className="btn-primary text-sm text-center"
                  >
                    Register
                  </NavLink>
                </div>
              ) : (
                /* Authenticated user row */
                <div className="flex items-center justify-between px-1 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${ROLE_COLOURS[user.role] || "bg-gray-100 text-gray-600"}`}>
                        {capitalise(user.role)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-red-600 font-medium hover:text-red-700 transition-colors"
                  >
                    <HiOutlineLogout className="text-lg" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
