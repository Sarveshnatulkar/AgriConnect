import { useNavigate, Link } from "react-router-dom";
import { HiOutlineHeart, HiOutlineTrash, HiOutlineExternalLink } from "react-icons/hi";
import { FaMapMarkerAlt, FaBoxOpen, FaHeart } from "react-icons/fa";
import useWishlist from "../../hooks/useWishlist";
import {
  formatCurrency,
  formatDate,
  capitalise,
} from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";

/**
 * WishlistPage — displays all crops saved by the user in localStorage.
 *
 * Route:  /wishlist
 * Access: Any authenticated user
 *
 * Data source: WishlistContext (localStorage) — no API call needed.
 *
 * Note to user: Saved crops reflect the data at the time they were saved.
 * If a farmer has updated or deleted the listing since then, this page
 * will show the old data until the user removes and re-adds it.
 */

const CATEGORY_STYLES = {
  vegetables: "bg-green-100  text-green-700",
  fruits:     "bg-purple-100 text-purple-700",
  grains:     "bg-amber-100  text-amber-700",
  pulses:     "bg-orange-100 text-orange-700",
  spices:     "bg-red-100    text-red-700",
  oilseeds:   "bg-yellow-100 text-yellow-700",
  dairy:      "bg-blue-100   text-blue-700",
  poultry:    "bg-rose-100   text-rose-700",
  other:      "bg-gray-100   text-gray-600",
};

const PLACEHOLDER = "https://placehold.co/400x260/f0fdf4/16a34a?text=No+Image";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist, count } = useWishlist();
  const navigate = useNavigate();

  // ── Empty state ───────────────────────────────────────────────────────────
  if (count === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <HiOutlineHeart className="text-2xl text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <p className="text-sm text-gray-500">Crops you've saved for later</p>
        </div>

        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <FaHeart className="text-4xl text-red-200" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">Your wishlist is empty</p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Browse the marketplace and tap the heart icon on any crop to save it here.
            </p>
          </div>
          <Link to={ROUTES.CROPS} className="btn-primary text-sm inline-flex items-center gap-2">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // ── Wishlist grid ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <FaHeart className="text-xl text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <p className="text-sm text-gray-500">
            {count} saved crop{count !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Clear your entire wishlist?")) clearWishlist();
          }}
          className="flex items-center gap-1.5 text-sm text-gray-400
                     hover:text-red-500 transition-colors self-start sm:self-auto"
        >
          <HiOutlineTrash className="text-base" />
          Clear All
        </button>
      </div>

      {/* ── Stale-data notice ──────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3
                      text-xs text-amber-700 flex items-start gap-2">
        <span className="shrink-0 mt-0.5">ℹ️</span>
        <span>
          Prices and availability shown here reflect the data when you last saved each crop.
          Open a listing to see the latest information.
        </span>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {wishlist.map((crop) => {
          const imageUrl  = crop.images?.[0]?.url || PLACEHOLDER;
          const catStyle  = CATEGORY_STYLES[crop.category] || CATEGORY_STYLES.other;
          const location  = [crop.location?.district, crop.location?.state]
                              .filter(Boolean).join(", ");

          return (
            <article
              key={crop._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm
                         hover:shadow-md transition-shadow duration-200
                         overflow-hidden flex flex-col group"
            >
              {/* Image */}
              <div className="relative h-44 bg-gray-100 overflow-hidden shrink-0">
                <img
                  src={imageUrl}
                  alt={crop.cropName}
                  className="w-full h-full object-cover
                             group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                />
                {/* Category pill */}
                <span className={`absolute top-3 left-3 text-xs font-semibold
                                  px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm
                                  border border-gray-100 ${catStyle}`}>
                  {capitalise(crop.category)}
                </span>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(crop._id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full
                             bg-red-500 text-white flex items-center justify-center
                             hover:bg-red-600 transition-colors shadow-sm"
                  aria-label={`Remove ${crop.cropName} from wishlist`}
                >
                  <FaHeart className="text-sm" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-2.5 flex-1">
                <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                  {crop.cropName}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-primary-600 tabular-nums">
                    {formatCurrency(crop.price)}
                  </span>
                  <span className="text-xs text-gray-400">
                    / {crop.priceUnit || crop.unit}
                  </span>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <FaBoxOpen className="text-gray-400 shrink-0" />
                  <span>{crop.quantity} {crop.unit} available</span>
                </div>

                {/* Location */}
                {location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}

                {/* Saved date note */}
                <p className="text-xs text-gray-400">
                  Listed {formatDate(crop.createdAt)}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/crops/${crop._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                               text-sm font-semibold rounded-xl
                               bg-primary-50 text-primary-700
                               hover:bg-primary-600 hover:text-white
                               transition-colors duration-150"
                    aria-label={`View details for ${crop.cropName}`}
                  >
                    <HiOutlineExternalLink className="text-base" />
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(crop._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2.5
                               text-sm rounded-xl bg-red-50 text-red-500
                               hover:bg-red-500 hover:text-white
                               transition-colors duration-150"
                    aria-label={`Remove ${crop.cropName} from wishlist`}
                  >
                    <HiOutlineTrash className="text-base" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
