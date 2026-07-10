import axios from "axios";

/**
 * Axios instance — the single HTTP client used across the entire frontend.
 *
 * Why a shared instance?
 *  - One place to set baseURL, headers, and interceptors
 *  - Consistent error handling across all API calls
 *  - Easy to update the base URL for different environments
 *
 * `withCredentials: true` tells Axios to send cookies on every request.
 * This is required for our HTTP-only JWT cookie to be included.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,          // Send cookies cross-origin
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Response interceptor — global error handling.
 * If the server returns 401 (token expired / not logged in),
 * we can redirect to login here in Phase 2.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    // In Phase 2 we will handle 401 redirects here
    return Promise.reject(new Error(message));
  }
);

export default api;
