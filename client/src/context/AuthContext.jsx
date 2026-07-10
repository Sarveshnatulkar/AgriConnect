import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../services/authService";
import { ROLE_DASHBOARD, ROUTES } from "../utils/constants";

/**
 * AuthContext — global authentication state for the entire application.
 *
 * What it stores:
 *  - user    → the currently logged-in user object (null if not authenticated)
 *  - loading → true while the initial session check is running on mount
 *
 * What it exposes:
 *  - login(data)    → calls API, sets user, redirects to role dashboard
 *  - register(data) → calls API, sets user, redirects to role dashboard
 *  - logout()       → calls API, clears user, redirects to /login
 *  - isAuthenticated → boolean derived from user !== null
 *
 * Session rehydration on mount:
 *  When the app loads (or the browser tab is refreshed), we call GET /auth/me
 *  using the stored HTTP-only cookie. If it's valid, user is set silently.
 *  If it fails (expired / no cookie), user stays null. The `loading` flag
 *  stays true during this check — ProtectedRoute waits for it before
 *  deciding to redirect. This prevents the "flicker" where a logged-in
 *  user briefly sees the login page on refresh.
 */

// ── Create the context ────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // starts true — session check pending
  const navigate = useNavigate();

  // ── Session Rehydration ─────────────────────────────────────────────────────
  // Runs once on mount. Silently checks whether a valid cookie exists.
  // useCallback so the function reference is stable if we ever need to
  // expose a "refresh user" function.
  const checkAuth = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data.user);
    } catch {
      // 401 → no valid cookie → user stays null. This is expected.
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = async (formData) => {
    const res = await registerUser(formData);
    setUser(res.data.user);
    toast.success(res.message || "Account created successfully!");
    // Redirect to the correct dashboard based on role
    navigate(ROLE_DASHBOARD[res.data.user.role] || ROUTES.HOME);
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (formData) => {
    const res = await loginUser(formData);
    setUser(res.data.user);
    toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}!`);
    navigate(ROLE_DASHBOARD[res.data.user.role] || ROUTES.HOME);
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Even if the API call fails, clear local state and redirect.
      // The cookie will expire naturally.
    } finally {
      setUser(null);
      toast.success("Logged out successfully");
      navigate(ROUTES.LOGIN);
    }
  };

  // ── Update local user state ──────────────────────────────────────────────────
  // Called by ProfilePage after a successful PUT /users/profile so the
  // Navbar avatar/name updates immediately without a page reload.
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // ── Context Value ───────────────────────────────────────────────────────────
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom Hook ───────────────────────────────────────────────────────────────
/**
 * useAuth — consume the AuthContext in any component.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *
 * Throws if called outside of <AuthProvider> — catches wiring mistakes early.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
};

export default AuthContext;
