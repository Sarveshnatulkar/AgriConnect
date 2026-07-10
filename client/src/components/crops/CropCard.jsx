import { FaMapMarkerAlt, FaLeaf, FaBoxOpen, FaCalendarAlt } from "react-icons/fa";
import { capitalise, formatDate, formatCurrency } from "../../utils/helpers";

/**
 * CropCard — displays a single crop listing in the marketplace grid.
 *
 * Props:
 *  @param {Object} crop  - A crop document from GET /api/v1/crops
 *
 * Data mapping (field → source):
 *  image        → crop.images[0]?.url  (fallback to placeholder)
 *  crop name    → crop.cropName
 *  category     → crop.category        (capitalised)
 *  quantity     → crop.quantity + crop.unit
 *  price        → crop.price + crop.priceUnit
 *  seller name  → crop.owner.name
 *  location     → crop.location.district + crop.location.state
 *  harvest date → crop.harvestDate     (formatted, omitted if null)
 *
 * Click behaviour:
 *  TODO: Navigate to /crops/:id when CropDetailPage is built.
 *        For now the card is visually interactive but does not navigate.
 */

// ── Category colour mapping ────────────────────────────────────────────────────
const CATEGORY_STYLES = {
  vegetables: { pill: "bg-green-100  text-green-700",  dot: "bg-green-500"  },
  fruits:     { pill: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  grains:     { pill: "bg-amber-100  text-amber-700",  dot: "bg-amber-500"  },
  pulses:     { pill: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  spices:     { pill: "bg-red-100    text-red-700",    dot: "bg-red-500"    },
  oilseeds:   { pill: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  dairy:      { pill: "bg-blue-100   text-blue-700",   dot: "bg-blue-500"   },
  poultry:    { pill: "bg-rose-100   text-rose-700",   dot: "bg-rose-500"   },
  other:      { pill: "bg-gray-100   text-gray-600",   dot: "bg-gray-400"   },
};

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x260/f0fdf4/16a34a?text=No+Image";

const CropCard = ({ crop }) => {
  const {
    cropName,
    category,
    quantity,
    unit,
    price,
    priceUnit,
    images,
    location,
    owner,
    harvestDate,
  } = crop;

  const imageUrl      = images?.[0]?.url || PLACEHOLDER_IMAGE;
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.other;
  const sellerName    = owner?.name || "Unknown Farmer";
  const district      = location?.district || "";
  const state         = location?.state    || "";
  const locationText  = [district, state].filter(Boolean).join(", ");

  return (
    <article
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group
                 flex flex-col"
      // TODO: Add onClick={() => navigate(`/crops/${crop._id}`)} when CropDetailPage is built
    >
      {/* ── Image ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden h-44 bg-gray-100 shrink-0">
        <img
          src={imageUrl}
          alt={cropName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // Silently fall back if the Cloudinary URL is broken
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />

        {/* Category pill — top left */}
        <span
          className={`absolute top-3 left-3 flex items-center gap-1.5 text-xs font-semibold
                      px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/90 border border-gray-100
                      ${categoryStyle.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dot}`} />
          {capitalise(category)}
        </span>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col gap-3 flex-1">

        {/* Crop name */}
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1">
          {cropName}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-primary-600 tabular-nums">
            {formatCurrency(price)}
          </span>
          <span className="text-sm text-gray-400 font-normal">
            / {priceUnit || unit}
          </span>
        </div>

        {/* Quantity badge */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <FaBoxOpen className="text-gray-400 shrink-0 text-base" />
          <span>
            <span className="font-medium">{quantity}</span>{" "}
            <span className="text-gray-400">{unit} available</span>
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-50 my-0.5" />

        {/* Seller */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FaLeaf className="text-primary-400 shrink-0" />
          <span className="font-medium text-gray-700 truncate">{sellerName}</span>
        </div>

        {/* Location */}
        {locationText && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FaMapMarkerAlt className="text-gray-400 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        )}

        {/* Harvest date — only shown when present */}
        {harvestDate && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FaCalendarAlt className="text-gray-400 shrink-0" />
            <span>Harvested: {formatDate(harvestDate)}</span>
          </div>
        )}

        {/* CTA — spacer pushes it to bottom */}
        <div className="mt-auto pt-3">
          <button
            type="button"
            className="w-full py-2.5 rounded-xl text-sm font-semibold
                       bg-primary-50 text-primary-700
                       hover:bg-primary-600 hover:text-white
                       transition-colors duration-200 focus:outline-none
                       focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            // TODO: Navigate to /crops/${crop._id} when CropDetailPage is built
            aria-label={`View details for ${cropName}`}
          >
            View Details
          </button>
        </div>

      </div>
    </article>
  );
};

export default CropCard;
