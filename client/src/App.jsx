import { Routes, Route } from "react-router-dom";

// Layout
import MainLayout     from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ScrollToTop    from "./components/common/ScrollToTop";

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

// Pages — profile
import ProfilePage from "./pages/profile/ProfilePage";

// Pages — farmer module
import MyCropsPage        from "./pages/crops/MyCropsPage";
import AddCropPage        from "./pages/crops/AddCropPage";
import EditCropPage       from "./pages/crops/EditCropPage";
import ReceivedOrdersPage from "./pages/orders/ReceivedOrdersPage";

// Pages — buyer module
import MyOrdersPage from "./pages/orders/MyOrdersPage";

// Pages — transporter module
import TransportDashboard from "./pages/transport/TransportDashboard";

// Pages — dashboards
import FarmerDashboard from "./pages/dashboard/FarmerDashboard";
import BuyerDashboard  from "./pages/dashboard/BuyerDashboard";

// Pages — admin module (own layout — no Navbar/Footer)
import AdminLayout        from "./pages/admin/AdminLayout";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import AdminUsers         from "./pages/admin/AdminUsers";
import AdminCrops         from "./pages/admin/AdminCrops";
import AdminOrders        from "./pages/admin/AdminOrders";
import AdminTransport     from "./pages/admin/AdminTransport";

// Constants
import { ROUTES, ROLES } from "./utils/constants";

/**
 * App.jsx — root route configuration.
 *
 * Two top-level route trees:
 *
 *  1. <MainLayout>  — public site (Navbar + Footer)
 *       /            HomePage (public)
 *       /login       LoginPage (public)
 *       /register    RegisterPage (public)
 *       /unauthorized
 *       /crops       MarketplacePage  (any auth)
 *       /crops/:id   CropDetailPage   (any auth)
 *       /wishlist    WishlistPage     (any auth)
 *       — farmer routes
 *       — buyer routes
 *       — transporter routes
 *       *  NotFoundPage
 *
 *  2. <AdminLayout> — admin panel (sidebar, no Navbar/Footer)
 *       /admin            AdminDashboardHome  (admin only)
 *       /admin/users      AdminUsers          (admin only)
 *       /admin/crops      AdminCrops          (admin only)
 *       /admin/orders     AdminOrders         (admin only)
 *       /admin/transport  AdminTransport      (admin only)
 */

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>

      {/* ════════════════════════════════════════════════════════════
          PUBLIC SITE — MainLayout (Navbar + Footer)
      ════════════════════════════════════════════════════════════ */}
      <Route element={<MainLayout />}>

        {/* ── Public ──────────────────────────────────────────────── */}
        <Route path={ROUTES.HOME}         element={<HomePage />} />
        <Route path={ROUTES.LOGIN}        element={<LoginPage />} />
        <Route path={ROUTES.REGISTER}     element={<RegisterPage />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

        {/* ── Any authenticated user ────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.CROPS}       element={<MarketplacePage />} />
          <Route path={ROUTES.CROP_DETAIL} element={<CropDetailPage />} />
          <Route path={ROUTES.WISHLIST}    element={<WishlistPage />} />
          <Route path={ROUTES.PROFILE}     element={<ProfilePage />} />
        </Route>

        {/* ── Farmer (+ admin) ────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.FARMER, ROLES.ADMIN]} />}>
          <Route path={ROUTES.FARMER_DASHBOARD} element={<FarmerDashboard />} />
          <Route path={ROUTES.MY_CROPS}          element={<MyCropsPage />} />
          <Route path={ROUTES.CROP_CREATE}       element={<AddCropPage />} />
          <Route path={ROUTES.CROP_EDIT}         element={<EditCropPage />} />
          <Route path={ROUTES.RECEIVED_ORDERS}   element={<ReceivedOrdersPage />} />
        </Route>

        {/* ── Buyer (+ admin) ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.BUYER, ROLES.ADMIN]} />}>
          <Route path={ROUTES.BUYER_DASHBOARD} element={<BuyerDashboard />} />
          <Route path={ROUTES.MY_ORDERS}       element={<MyOrdersPage />} />
        </Route>

        {/* ── Transporter (+ admin) ───────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TRANSPORTER, ROLES.ADMIN]} />}>
          <Route path={ROUTES.TRANSPORT_DASHBOARD} element={<TransportDashboard />} />
        </Route>

        {/* ── 404 ─────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Route>

      {/* ════════════════════════════════════════════════════════════
          ADMIN PANEL — AdminLayout (sidebar, no Navbar/Footer)
          All routes require role="admin". Non-admins are redirected
          to /unauthorized by ProtectedRoute.
      ════════════════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardHome />} />
          <Route path={ROUTES.ADMIN_USERS}     element={<AdminUsers />} />
          <Route path={ROUTES.ADMIN_CROPS}     element={<AdminCrops />} />
          <Route path={ROUTES.ADMIN_ORDERS}    element={<AdminOrders />} />
          <Route path={ROUTES.ADMIN_TRANSPORT} element={<AdminTransport />} />
        </Route>
      </Route>

    </Routes>
    </>
  );
}

export default App;
