import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import MainLayout    from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages — public
import HomePage      from "./pages/home/HomePage";
import LoginPage     from "./pages/auth/LoginPage";
import RegisterPage  from "./pages/auth/RegisterPage";
import NotFoundPage  from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Pages — dashboards
import FarmerDashboard from "./pages/dashboard/FarmerDashboard";
import BuyerDashboard  from "./pages/dashboard/BuyerDashboard";

// Constants
import { ROUTES, ROLES } from "./utils/constants";

/**
 * App.jsx — root route configuration.
 *
 * Route tree structure:
 *
 *  <MainLayout>                    — renders Navbar + Footer + <Outlet />
 *    /                             — HomePage          (public)
 *    /login                        — LoginPage         (public)
 *    /register                     — RegisterPage      (public)
 *    /unauthorized                 — UnauthorizedPage  (public)
 *
 *    <ProtectedRoute>              — any authenticated user
 *      /dashboard/farmer           — <ProtectedRoute allowedRoles={["farmer"]}>
 *      /dashboard/buyer            — <ProtectedRoute allowedRoles={["buyer"]}>
 *
 *    *                             — NotFoundPage (404)
 *
 * Phases ahead:
 *  Phase 5: /crops, /crops/:id, /crops/new, /crops/:id/edit  (farmer)
 *  Phase 6: buyer-specific routes
 *  Phase 8: /dashboard/transporter
 *  Phase 14: /dashboard/admin
 */

function App() {
  return (
    <Routes>
      {/* All routes share MainLayout (Navbar + Footer) */}
      <Route element={<MainLayout />}>

        {/* ── Public routes ─────────────────────────────────────────── */}
        <Route path={ROUTES.HOME}         element={<HomePage />} />
        <Route path={ROUTES.LOGIN}        element={<LoginPage />} />
        <Route path={ROUTES.REGISTER}     element={<RegisterPage />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

        {/* ── Protected: Farmer ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.FARMER, ROLES.ADMIN]} />}>
          <Route
            path={ROUTES.FARMER_DASHBOARD}
            element={<FarmerDashboard />}
          />
          {/* Phase 5: crop CRUD routes added here */}
        </Route>

        {/* ── Protected: Buyer ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.BUYER, ROLES.ADMIN]} />}>
          <Route
            path={ROUTES.BUYER_DASHBOARD}
            element={<BuyerDashboard />}
          />
        </Route>

        {/* ── Protected: Transporter (Phase 8) ─────────────────────── */}
        {/* <Route element={<ProtectedRoute allowedRoles={[ROLES.TRANSPORTER, ROLES.ADMIN]} />}>
          <Route path={ROUTES.TRANSPORTER_DASHBOARD} element={<TransporterDashboard />} />
        </Route> */}

        {/* ── Protected: Admin (Phase 14) ───────────────────────────── */}
        {/* <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        </Route> */}

        {/* ── /dashboard → redirect based on role (handled at runtime) */}
        {/* ProtectedRoute already redirects to the correct dashboard   */}

        {/* ── 404 ───────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
