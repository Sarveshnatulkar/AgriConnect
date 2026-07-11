import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES, ROLES } from "./utils/constants";

// Layout & route guards — always eagerly loaded (tiny, needed immediately)
import MainLayout     from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ScrollToTop    from "./components/common/ScrollToTop";

// ── Page-level loading fallback ───────────────────────────────────────────────
// Shown by Suspense while a lazy page chunk is downloading.
// Matches the existing full-screen spinner used in ProtectedRoute.
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent
                    rounded-full animate-spin" />
    <p className="text-sm text-gray-500">Loading…</p>
  </div>
);

// ── Eagerly loaded — tiny pages that are always needed on first visit ─────────
import HomePage         from "./pages/home/HomePage";
import LoginPage        from "./pages/auth/LoginPage";
import RegisterPage     from "./pages/auth/RegisterPage";
import NotFoundPage     from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// ── Lazily loaded — heavy pages that users only reach after navigating ────────
const MarketplacePage  = lazy(() => import("./pages/crops/MarketplacePage"));
const CropDetailPage   = lazy(() => import("./pages/crops/CropDetailPage"));
const WishlistPage     = lazy(() => import("./pages/crops/WishlistPage"));
const ProfilePage      = lazy(() => import("./pages/profile/ProfilePage"));

const MyCropsPage        = lazy(() => import("./pages/crops/MyCropsPage"));
const AddCropPage        = lazy(() => import("./pages/crops/AddCropPage"));
const EditCropPage       = lazy(() => import("./pages/crops/EditCropPage"));
const ReceivedOrdersPage = lazy(() => import("./pages/orders/ReceivedOrdersPage"));

const MyOrdersPage = lazy(() => import("./pages/orders/MyOrdersPage"));

const TransportDashboard = lazy(() => import("./pages/transport/TransportDashboard"));

const FarmerDashboard = lazy(() => import("./pages/dashboard/FarmerDashboard"));
const BuyerDashboard  = lazy(() => import("./pages/dashboard/BuyerDashboard"));

const AdminLayout        = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboardHome = lazy(() => import("./pages/admin/AdminDashboardHome"));
const AdminUsers         = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCrops         = lazy(() => import("./pages/admin/AdminCrops"));
const AdminOrders        = lazy(() => import("./pages/admin/AdminOrders"));
const AdminTransport     = lazy(() => import("./pages/admin/AdminTransport"));

/**
 * App.jsx — root route configuration.
 *
 * All major pages are lazy-loaded via React.lazy() so the initial JS bundle
 * only includes the home page, login, register, 404, and layout components.
 * Each page chunk is downloaded on first visit and cached by the browser.
 *
 * Two route trees:
 *  1. MainLayout  — public site with Navbar + Footer
 *  2. AdminLayout — admin sidebar panel (no Navbar/Footer)
 */
function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ════════════════════════════════════════════════════════
              PUBLIC SITE — MainLayout (Navbar + Footer)
          ════════════════════════════════════════════════════════ */}
          <Route element={<MainLayout />}>

            {/* Public */}
            <Route path={ROUTES.HOME}         element={<HomePage />} />
            <Route path={ROUTES.LOGIN}        element={<LoginPage />} />
            <Route path={ROUTES.REGISTER}     element={<RegisterPage />} />
            <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

            {/* Any authenticated user */}
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.CROPS}       element={<MarketplacePage />} />
              <Route path={ROUTES.CROP_DETAIL} element={<CropDetailPage />} />
              <Route path={ROUTES.WISHLIST}    element={<WishlistPage />} />
              <Route path={ROUTES.PROFILE}     element={<ProfilePage />} />
            </Route>

            {/* Farmer (+ admin) */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.FARMER, ROLES.ADMIN]} />}>
              <Route path={ROUTES.FARMER_DASHBOARD} element={<FarmerDashboard />} />
              <Route path={ROUTES.MY_CROPS}          element={<MyCropsPage />} />
              <Route path={ROUTES.CROP_CREATE}       element={<AddCropPage />} />
              <Route path={ROUTES.CROP_EDIT}         element={<EditCropPage />} />
              <Route path={ROUTES.RECEIVED_ORDERS}   element={<ReceivedOrdersPage />} />
            </Route>

            {/* Buyer (+ admin) */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.BUYER, ROLES.ADMIN]} />}>
              <Route path={ROUTES.BUYER_DASHBOARD} element={<BuyerDashboard />} />
              <Route path={ROUTES.MY_ORDERS}       element={<MyOrdersPage />} />
            </Route>

            {/* Transporter (+ admin) */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.TRANSPORTER, ROLES.ADMIN]} />}>
              <Route path={ROUTES.TRANSPORT_DASHBOARD} element={<TransportDashboard />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />

          </Route>

          {/* ════════════════════════════════════════════════════════
              ADMIN PANEL — AdminLayout (sidebar, no Navbar/Footer)
          ════════════════════════════════════════════════════════ */}
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
      </Suspense>
    </>
  );
}

export default App;
