import { Routes, Route } from "react-router-dom";

// Layout
import MainLayout     from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages — public
import HomePage         from "./pages/home/HomePage";
import LoginPage        from "./pages/auth/LoginPage";
import RegisterPage     from "./pages/auth/RegisterPage";
import NotFoundPage     from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Pages — marketplace (any authenticated user)
import MarketplacePage  from "./pages/crops/MarketplacePage";
import CropDetailPage   from "./pages/crops/CropDetailPage";
import WishlistPage     from "./pages/crops/WishlistPage";

// Pages — farmer module
import MyCropsPage  from "./pages/crops/MyCropsPage";
import AddCropPage  from "./pages/crops/AddCropPage";
import EditCropPage from "./pages/crops/EditCropPage";

// Pages — dashboards
import FarmerDashboard from "./pages/dashboard/FarmerDashboard";
import BuyerDashboard  from "./pages/dashboard/BuyerDashboard";

// Constants
import { ROUTES, ROLES } from "./utils/constants";

/**
 * App.jsx — root route configuration.
 *
 * Route tree:
 *
 *  <MainLayout>
 *    /              — HomePage          (public)
 *    /login         — LoginPage         (public)
 *    /register      — RegisterPage      (public)
 *    /unauthorized  — UnauthorizedPage  (public)
 *
 *    <ProtectedRoute>                   — any authenticated user
 *      /crops                           — MarketplacePage
 *
 *    <ProtectedRoute allowedRoles={["farmer","admin"]}>
 *      /dashboard/farmer                — FarmerDashboard
 *      /crops/my                        — MyCropsPage
 *      /crops/new                       — AddCropPage
 *      /crops/:id/edit                  — EditCropPage
 *
 *    <ProtectedRoute allowedRoles={["buyer","admin"]}>
 *      /dashboard/buyer                 — BuyerDashboard
 *
 *    *  — NotFoundPage (404)
 *
 * Route ordering note:
 *  /crops/my and /crops/new MUST be defined before /crops/:id/edit in the
 *  farmer block to prevent React Router from treating "my" or "new" as
 *  dynamic :id segments. (React Router v6 uses specificity ranking so this
 *  is not strictly required, but explicit ordering makes intent clear.)
 */

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        {/* ── Public routes ─────────────────────────────────────────── */}
        <Route path={ROUTES.HOME}         element={<HomePage />} />
        <Route path={ROUTES.LOGIN}        element={<LoginPage />} />
        <Route path={ROUTES.REGISTER}     element={<RegisterPage />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

        {/* ── Any authenticated user ────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.CROPS}       element={<MarketplacePage />} />
          <Route path={ROUTES.CROP_DETAIL} element={<CropDetailPage />} />
          <Route path={ROUTES.WISHLIST}    element={<WishlistPage />} />
        </Route>

        {/* ── Farmer (+ admin) ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.FARMER, ROLES.ADMIN]} />}>
          <Route path={ROUTES.FARMER_DASHBOARD} element={<FarmerDashboard />} />
          <Route path={ROUTES.MY_CROPS}         element={<MyCropsPage />} />
          <Route path={ROUTES.CROP_CREATE}      element={<AddCropPage />} />
          <Route path={ROUTES.CROP_EDIT}        element={<EditCropPage />} />
        </Route>

        {/* ── Buyer (+ admin) ───────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.BUYER, ROLES.ADMIN]} />}>
          <Route path={ROUTES.BUYER_DASHBOARD} element={<BuyerDashboard />} />
        </Route>

        {/* ── Transporter (Phase 8) ─────────────────────────────────── */}
        {/* <Route element={<ProtectedRoute allowedRoles={[ROLES.TRANSPORTER, ROLES.ADMIN]} />}>
          <Route path={ROUTES.TRANSPORTER_DASHBOARD} element={<TransporterDashboard />} />
        </Route> */}

        {/* ── Admin (Phase 14) ──────────────────────────────────────── */}
        {/* <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        </Route> */}

        {/* ── 404 ───────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
}

export default App;
