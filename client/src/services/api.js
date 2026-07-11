import axios from "axios";

/**
 * Axios instance — the single HTTP client for the entire frontend.
 *
 * Design decisions:
 *
 * 1. `withCredentials: true`
 *    Required so the browser sends the HTTP-only JWT cookie on every request,
 *    including cross-origin requests to the Render-hosted backend.
 *
 * 2. baseURL reads from VITE_API_BASE_URL
 *    In development, Vite proxies /api → localhost:5000, so the value is
 *    just "/api/v1". In production it becomes the full Render backend URL.
 *
 * 3. Response interceptor handles 401 globally
 *    When the server returns 401 (expired cookie / invalid token), we
 *    redirect to /login without every single component needing to handle it.
 *    We use window.location instead of React Router navigate() because this
 *    module lives outside the React component tree.
 */

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  // Success: pass the response straight through
  (response) => response,

  // Error: normalise the error message and handle 401 globally
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message
      || error.message
      || "Something went wrong";

    // 401 = session expired or not logged in.
    // Redirect to login, but only when an authenticated API call fails —
    // never during the initial session check (/auth/me), which returns 401
    // simply to signal "no active session" and is handled by AuthContext.
    if (status === 401) {
      const currentPath  = window.location.pathname;
      const requestUrl   = error.config?.url || "";
      const isSessionCheck = requestUrl.includes("/auth/me");

      if (!isSessionCheck && currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = "/login";
      }
    }

    // Reject with a plain Error so callers get a consistent `.message` string
    return Promise.reject(new Error(message));
  }
);

export default api;
