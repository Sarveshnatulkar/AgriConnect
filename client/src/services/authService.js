import api from "./api";

/**
 * Auth Service — wraps all auth-related API calls.
 *
 * Why a separate service layer instead of calling `api` directly in context?
 *
 *  - Context handles state. Services handle HTTP. Single responsibility.
 *  - If the backend URL or request shape changes, you update it here, not
 *    in every component or context file that uses it.
 *  - Easy to mock in tests — just mock authService, not the Axios instance.
 *
 * Every function returns `response.data` so callers work with the payload
 * directly, not the full Axios response envelope.
 */

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, role: string }} data
 * @returns {Promise<{ success: boolean, message: string, data: { user } }>}
 */
export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

/**
 * Log in with email + password.
 * The server sets an HTTP-only JWT cookie on success.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ success: boolean, message: string, data: { user } }>}
 */
export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

/**
 * Log out — clears the JWT cookie on the server.
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

/**
 * Fetch the currently authenticated user using the stored cookie.
 * Called on app mount to rehydrate auth state.
 * @returns {Promise<{ success: boolean, data: { user } }>}
 */
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
