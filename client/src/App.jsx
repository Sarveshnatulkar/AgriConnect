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
import MyCropsPage       from "./pages/crops/MyCropsPage";
import AddCropPage       from "./pages/crops/AddCropPage";
import EditCropPage      from "./pages/crops/EditCropPage";
import ReceivedOrdersPage from "./pages/orders/ReceivedOrdersPage";

// Pages — buyer module
import MyOrdersPage from "./pages/orders/MyOrdersPage";

// Pages — transporter module
import TransportDashboard from "./pages/transport/TransportDashboard";

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
 *    /                    — HomePage           (public)
 *    /login               — LoginPage          (public)
 *    /register            — RegisterPage       (public)
 *    /unauthorized        — UnauthorizedPage   (public)
 *
 *    <ProtectedRoute>     — any authenticated user
 *      /crops             — MarketplacePage
 *      /crops/:id         — CropDetailPage
 *      /wishlist          — WishlistPage
 *
 *    <ProtectedRoute allowedRoles={["farmer","admin"]}>
 *      /dashboard/farmer  — FarmerDashboard
 *      /crops/my          — MyCropsPage
 *      /crops/new         — AddCropPage
 *      /crops/:id/edit    — EditCropPage
 *      /orders/received   — ReceivedOrdersPage
 *
 *    <ProtectedRoute allowedRoles={["buyer","admin"]}>
 *      /dashboard/buyer   — BuyerDashboard
 *      /orders/my         — MyOrdersPage
 *
 *    <ProtectedRoute allowedRoles={["transporter","admin"]}>
 *      /dashboard/transporter — TransportDashboard
 *
 *    *  — NotFoundPage (404)
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
          <Route path={ROUTES.MY_CROPS}          element={<MyCropsPage />} />
          <Route path={ROUTES.CROP_CREATE}       element={<AddCropPage />} />
          <Route path={ROUTES.CROP_EDIT}         element={<EditCropPage />} />
          <Route path={ROUTES.RECEIVED_ORDERS}   element={<ReceivedOrdersPage />} />
        </Route>

        {/* ── Buyer (+ admin) ───────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.BUYER, ROLES.ADMIN]} />}>
          <Route path={ROUTES.BUYER_DASHBOARD} element={<BuyerDashboard />} />
          <Route path={ROUTES.MY_ORDERS}       element={<MyOrdersPage />} />
        </Route>

        {/* ── Transporter (+ admin) ─────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TRANSPORTER, ROLES.ADMIN]} />}>
          <Route path={ROUTES.TRANSPORT_DASHBOARD} element={<TransportDashboard />} />
        </Route>

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
