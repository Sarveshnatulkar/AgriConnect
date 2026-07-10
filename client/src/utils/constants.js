/**
 * Application-wide constants
 *
 * Centralising these prevents magic strings scattered across components.
 * When a route path changes, you update it here — not in 15 different files.
 */

// ─── User Roles ───────────────────────────────────────────────────────────────
export const ROLES = {
  FARMER:      "farmer",
  BUYER:       "buyer",
  TRANSPORTER: "transporter",
  ADMIN:       "admin",
};

// ─── Route Paths ──────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME:           "/",
  LOGIN:          "/login",
  REGISTER:       "/register",
  UNAUTHORIZED:   "/unauthorized",

  // Dashboards
  FARMER_DASHBOARD:      "/dashboard/farmer",
  BUYER_DASHBOARD:       "/dashboard/buyer",
  TRANSPORTER_DASHBOARD: "/dashboard/transporter",
  ADMIN_DASHBOARD:       "/dashboard/admin",

  // Crops
  CROPS:         "/crops",
  MY_CROPS:      "/crops/my",
  CROP_DETAIL:   "/crops/:id",
  CROP_CREATE:   "/crops/new",
  CROP_EDIT:     "/crops/:id/edit",

  // Buyer
  WISHLIST:      "/wishlist",
};

// ─── Role → Dashboard mapping ─────────────────────────────────────────────────
// Used by ProtectedRoute and post-login redirects to send each role
// to the correct dashboard without a chain of if/else blocks.
export const ROLE_DASHBOARD = {
  [ROLES.FARMER]:      ROUTES.FARMER_DASHBOARD,
  [ROLES.BUYER]:       ROUTES.BUYER_DASHBOARD,
  [ROLES.TRANSPORTER]: ROUTES.TRANSPORTER_DASHBOARD,
  [ROLES.ADMIN]:       ROUTES.ADMIN_DASHBOARD,
};
