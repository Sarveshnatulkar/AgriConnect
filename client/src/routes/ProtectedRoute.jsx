import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";

/**
 * ProtectedRoute — guards routes that require authentication and/or a specific role.
 *
 * Props:
 *  @param {string[]} allowedRoles  Optional array of roles that may access the route.
 *                                  If omitted, any authenticated user is allowed.
 *
 * Behaviour:
 *  1. While session check is pending (loading === true), render a full-screen
 *     spinner. This prevents the flicker where a logged-in user sees the
 *     login page for a split second on page refresh.
 *
 *  2. If the user is not authenticated → redirect to /login.
 *     We pass `state: { from: location }` so after login the user is
 *     returned to the page they originally tried to visit.
 *
 *  3. If allowedRoles is provided and the user's role is not in the list
 *     → redirect to /unauthorized (403 page).
 *
 *  4. If all checks pass → render <Outlet /> (the child route).
 *
 * Usage in App.jsx:
 *
 *   // Any authenticated user
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/profile" element={<ProfilePage />} />
 *   </Route>
 *
 *   // Farmer only
 *   <Route element={<ProtectedRoute allowedRoles={["farmer"]} />}>
 *     <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
 *   </Route>
 *
 *   // Admin or farmer
 *   <Route element={<ProtectedRoute allowedRoles={["admin", "farmer"]} />}>
 *     <Route path="/crops/new" element={<CreateCropPage />} />
 *   </Route>
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // ── Loading state ───────────────────────────────────────────────────────────
  // Session check (GET /auth/me) is still in flight — render a spinner.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ───────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}   // remember the intended destination
        replace
      />
    );
  }

  // ── Role check ──────────────────────────────────────────────────────────────
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    }
  }

  // ── Authorised ──────────────────────────────────────────────────────────────
  return <Outlet />;
};

export default ProtectedRoute;
