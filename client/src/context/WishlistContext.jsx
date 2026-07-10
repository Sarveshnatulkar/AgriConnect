import { createContext, useContext, useState, useCallback, useEffect } from "react";
import useAuth from "../hooks/useAuth";

/**
 * WishlistContext — per-user wishlist backed by localStorage.
 *
 * Storage strategy:
 *   Key:   "agri_wishlist_<userId>"   ← scoped to the logged-in user's ID
 *   Value: JSON array of full crop objects.
 *
 * Why per-user keys?
 *   Without scoping, logging in as a different account would show the
 *   previous user's saved crops. Each user now gets an isolated wishlist.
 *   When the user logs out (userId becomes null) the wishlist empties in
 *   memory but the localStorage data is preserved for when they log back in.
 *
 * Why store full objects instead of just IDs?
 *   The Wishlist page renders instantly without any API call.
 *
 * Known tradeoff:
 *   If a farmer updates or deletes a listing, the cached copy in localStorage
 *   reflects the old data until the user removes and re-adds it.
 */

const BASE_KEY = "agri_wishlist";

// ── Storage helpers ───────────────────────────────────────────────────────────
const storageKey = (userId) => (userId ? `${BASE_KEY}_${userId}` : BASE_KEY);

const readFromStorage = (userId) => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeToStorage = (userId, items) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(items));
  } catch {
    // Quota exceeded or private browsing — fail silently
  }
};

// ─────────────────────────────────────────────────────────────────────────────
const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const userId   = user?._id || null;

  // Initialise from the correct per-user key
  const [wishlist, setWishlist] = useState(() => readFromStorage(userId));

  // Re-load the correct wishlist whenever the logged-in user changes
  // (login, logout, or switch account in the same browser)
  useEffect(() => {
    setWishlist(readFromStorage(userId));
  }, [userId]);

  // ── Toggle ────────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback(
    (crop) => {
      setWishlist((prev) => {
        const exists = prev.some((c) => c._id === crop._id);
        const next   = exists
          ? prev.filter((c) => c._id !== crop._id)
          : [...prev, crop];
        writeToStorage(userId, next);
        return next;
      });
    },
    [userId]
  );

  // ── Check ─────────────────────────────────────────────────────────────────
  const isWishlisted = useCallback(
    (cropId) => wishlist.some((c) => c._id === cropId),
    [wishlist]
  );

  // ── Clear all ─────────────────────────────────────────────────────────────
  const clearWishlist = useCallback(() => {
    setWishlist([]);
    writeToStorage(userId, []);
  }, [userId]);

  // ── Remove single item ────────────────────────────────────────────────────
  const removeFromWishlist = useCallback(
    (cropId) => {
      setWishlist((prev) => {
        const next = prev.filter((c) => c._id !== cropId);
        writeToStorage(userId, next);
        return next;
      });
    },
    [userId]
  );

  const value = {
    wishlist,
    toggleWishlist,
    removeFromWishlist,
    isWishlisted,
    clearWishlist,
    count: wishlist.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// ── Custom hook ───────────────────────────────────────────────────────────────
export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
};

export default WishlistContext;
