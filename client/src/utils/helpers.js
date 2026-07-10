/**
 * General-purpose utility functions
 *
 * These are pure functions with no side effects and no framework imports.
 * They can be used anywhere in the codebase.
 */

/**
 * Capitalises the first letter of a string.
 * Used for displaying role names, category labels, etc.
 * @param {string} str
 * @returns {string}
 */
export const capitalise = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats a number as Indian Rupees.
 * @param {number} amount
 * @returns {string}  e.g. "₹ 1,200.00"
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats an ISO date string into a readable format.
 * @param {string|Date} date
 * @returns {string}  e.g. "15 Jun 2026"
 */
export const formatDate = (date) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  }).format(new Date(date));
};

/**
 * Truncates a string to a maximum length and appends "…".
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
};

/**
 * Returns initials from a full name — used for avatar fallbacks.
 * "John Farmer" → "JF"
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join("");
};

/**
 * Extracts a readable error message from various error shapes.
 * Handles: Axios errors, plain Error objects, and string messages.
 * @param {unknown} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (!error) return "Something went wrong";
  if (typeof error === "string") return error;
  // Axios error with backend message
  if (error?.response?.data?.message) return error.response.data.message;
  // Standard Error object
  if (error?.message) return error.message;
  return "Something went wrong";
};
