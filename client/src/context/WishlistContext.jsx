import { createContext, useContext, useState, useCallback } from "react";

/**
 * WishlistContext — frontend-only wishlist backed by localStorage.
 *
 * Storage strategy:
 *   Key:   "agri_wishlist"
 *   Value: JSON array of full crop objects (not just IDs).
 *
 * Why store full objects instead of just IDs?
 *   The Wishlist page renders without any API call. Storing the full crop
 *   object means the page is instant and works offline.
 *
 * Known tradeoff:
 *   If a farmer deletes a crop, the wishlisted copy remains in localStorage
 *   until the user removes it. The WishlistPage notes this to the user.
 *   A production-grade implementation would validate IDs against the API
 *   on page load — that's a straightforward future enhancement.
 *
 * Exposed via context:
 *   wishlist        — current array of saved crop objects
 *   toggleWishlist  — add if absent, remove if present (by _id)
 *   isWishlisted    — boolean check by crop._id
 *   clearWishlist   — remove all saved crops
 *   count           — number of wishlisted items (for badge)
 */

const LS_KEY = "agri_wishlist";

// ── Safe localStorage helpers ─────────────────────────────────────────────────
const readFromStorage = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeToStorage = (items) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    // localStorage quota exceeded or private browsing restriction — fail silently
  }
};

// ─────────────────────────────────────────────────────────────────────────────
const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  // Initialise from localStorage so state survives page refresh
  const [wishlist, setWishlist] = useState(() => readFromStorage());

  // ── Toggle ────────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback((crop) => {
    setWishlist((prev) => {
      const exists = prev.some((c) => c._id === crop._id);
      const next   = exists
        ? prev.filter((c) => c._id !== crop._id)
        : [...prev, crop];
      writeToStorage(next);
      return next;
    });
  }, []);

  // ── Check ─────────────────────────────────────────────────────────────────
  const isWishlisted = useCallback(
    (cropId) => wishlist.some((c) => c._id === cropId),
    [wishlist]
  );

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clearWishlist = useCallback(() => {
    setWishlist([]);
    writeToStorage([]);
  }, []);

  // ── Remove single item (used by WishlistPage) ─────────────────────────────
  const removeFromWishlist = useCallback((cropId) => {
    setWishlist((prev) => {
      const next = prev.filter((c) => c._id !== cropId);
      writeToStorage(next);
      return next;
    });
  }, []);

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
