import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineTag,
  HiHeart,
  HiOutlineHeart,
  HiOutlineShoppingCart,
} from "react-icons/hi";
import { FaBoxOpen, FaLeaf, FaSeedling } from "react-icons/fa";
import { MdOutlineStorefront } from "react-icons/md";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import ContactSellerModal from "../../components/crops/ContactSellerModal";
import PlaceOrderModal from "../../components/orders/PlaceOrderModal";
import { fetchCropById } from "../../services/cropService";
import useWishlist from "../../hooks/useWishlist";
import useAuth from "../../hooks/useAuth";
import {
  formatCurrency,
  formatDate,
  capitalise,
  getInitials,
  getErrorMessage,
} from "../../utils/helpers";
import { ROUTES, ROLES } from "../../utils/constants";

/**
 * CropDetailPage — full detail view for a single crop listing.
 *
 * Route:  /crops/:id
 * Access: Any authenticated user (ProtectedRoute in App.jsx)
 *
 * Layout (desktop): 2-column — large image left, info + actions right
 * Layout (mobile):  single column — image top, info below
 *
 * Features:
 *  - Wishlist toggle (heart button, instant UI update)
 *  - Contact Seller button → ContactSellerModal
 *  - Back navigation
 *  - Loading / error / not-found states
 */

// ── Category colours ─────────────────────────────────────────────────────────
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

const PLACEHOLDER_IMAGE =
  "https://placehold.co/800x500/f0fdf4/16a34a?text=No+Image";

// ── Info row sub-component ────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100
                      flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const CropDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [crop,          setCrop]        = useState(null);
  const [loading,       setLoading]     = useState(true);
  const [error,         setError]       = useState(null);
  const [contactOpen,   setContactOpen] = useState(false);
  const [orderOpen,     setOrderOpen]   = useState(false);
  const [activeImg,     setActiveImg]   = useState(0);

  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = crop ? isWishlisted(crop._id) : false;

  // Buyers can order; farmers/transporters see Contact only
  const canOrder = user?.role === ROLES.BUYER;

  // ── Fetch crop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchCropById(id);
        setCrop(res.data.crop);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Wishlist toggle ───────────────────────────────────────────────────────
  const handleWishlist = () => {
    if (!crop) return;
    toggleWishlist(crop);
    toast.success(
      isWishlisted(crop._id)
        ? `Removed from wishlist`
        : `Added to wishlist`
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Spinner size="w-10 h-10" />
        <p className="text-sm text-gray-500">Loading crop details…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center py-24 gap-4 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <FaSeedling className="text-3xl text-red-300" />
        </div>
        <div>
          <p className="font-bold text-gray-800 text-base">Failed to load crop</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-sm px-6"
          >
            Try Again
          </button>
          <Link to={ROUTES.CROPS} className="btn-secondary text-sm px-6">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!crop) return null;

  const {
    cropName, category, description,
    quantity, unit, price, priceUnit,
    harvestDate, createdAt, isAvailable,
    images, location, owner,
  } = crop;

  const imageList   = images?.length ? images : [{ url: PLACEHOLDER_IMAGE }];
  const catStyle    = CATEGORY_STYLES[category] || CATEGORY_STYLES.other;
  const locationStr = [location?.village, location?.district, location?.state]
                        .filter(Boolean).join(", ");

  return (
    <>
      {/* Contact seller modal */}
      {contactOpen && (
        <ContactSellerModal
          seller={owner}
          cropName={cropName}
          onClose={() => setContactOpen(false)}
        />
      )}

      {/* Place order modal — buyers only */}
      {orderOpen && (
        <PlaceOrderModal
          crop={crop}
          onClose={() => setOrderOpen(false)}
          onSuccess={() => navigate(ROUTES.MY_ORDERS)}
        />
      )}

      <div className="flex flex-col gap-6">

        {/* ── Breadcrumb + back ────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500
                       hover:text-primary-600 transition-colors"
          >
            <HiOutlineArrowLeft className="text-base" />
            Back
          </button>
          <span className="text-gray-300">/</span>
          <Link to={ROUTES.CROPS} className="text-sm text-gray-500 hover:text-primary-600">
            Marketplace
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
            {cropName}
          </span>
        </div>

        {/* ── Main content grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── LEFT: Images ───────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
              <img
                src={imageList[activeImg]?.url || PLACEHOLDER_IMAGE}
                alt={cropName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
              />

              {/* Availability badge */}
              <span className={`absolute top-4 left-4 text-xs font-semibold
                                px-3 py-1.5 rounded-full backdrop-blur-sm
                                ${isAvailable
                                  ? "bg-primary-600 text-white"
                                  : "bg-gray-600 text-white"
                                }`}>
                {isAvailable ? "Available" : "Sold Out"}
              </span>

              {/* Wishlist button */}
              <button
                type="button"
                onClick={handleWishlist}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full
                            flex items-center justify-center shadow-md
                            transition-all duration-150 backdrop-blur-sm
                            ${wishlisted
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-white/90 text-gray-500 hover:bg-white hover:text-red-500"
                            }`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlisted
                  ? <HiHeart className="text-xl" />
                  : <HiOutlineHeart className="text-xl" />
                }
              </button>
            </div>

            {/* Thumbnail strip — only show if > 1 image */}
            {imageList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imageList.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2
                                transition-all duration-150
                                ${activeImg === i
                                  ? "border-primary-500 ring-2 ring-primary-200"
                                  : "border-transparent hover:border-gray-300"
                                }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Info & actions ───────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Name + category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catStyle}`}>
                  {capitalise(category)}
                </span>
                <span className="text-xs text-gray-400">
                  Listed {formatDate(createdAt)}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                {cropName}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-primary-600 tabular-nums">
                {formatCurrency(price)}
              </span>
              <span className="text-lg text-gray-400">/ {priceUnit || unit}</span>
            </div>

            {/* Info grid */}
            <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-4">
              <InfoRow
                icon={<FaBoxOpen className="text-gray-400 text-sm" />}
                label="Quantity Available"
                value={`${quantity} ${unit}`}
              />
              <InfoRow
                icon={<HiOutlineCalendar className="text-gray-400 text-base" />}
                label="Harvest Date"
                value={harvestDate ? formatDate(harvestDate) : null}
              />
              <InfoRow
                icon={<HiOutlineLocationMarker className="text-gray-400 text-base" />}
                label="Location"
                value={locationStr || null}
              />
              <InfoRow
                icon={<HiOutlineTag className="text-gray-400 text-base" />}
                label="Category"
                value={capitalise(category)}
              />
            </div>

            {/* Description */}
            {description && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  About this crop
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>
            )}

            {/* Seller card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4
                            flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br
                              from-primary-500 to-primary-700 flex items-center
                              justify-center text-white font-bold text-base shrink-0">
                {getInitials(owner?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {owner?.name || "Unknown Farmer"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <FaLeaf className="text-primary-500 text-xs" />
                  <span className="text-xs text-primary-600 font-medium">
                    Verified Seller
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                  {owner?.email && (
                    <span className="flex items-center gap-1">
                      <HiOutlineMail className="text-xs" />
                      {owner.email}
                    </span>
                  )}
                  {owner?.phone && (
                    <span className="flex items-center gap-1">
                      <HiOutlinePhone className="text-xs" />
                      {owner.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {/* Place Order — buyers only, crop must be available */}
              {canOrder && isAvailable && (
                <button
                  type="button"
                  onClick={() => setOrderOpen(true)}
                  className="w-full flex items-center justify-center gap-2
                             bg-primary-600 text-white font-semibold py-3.5
                             rounded-xl hover:bg-primary-700 transition-colors
                             text-base focus:outline-none focus:ring-2
                             focus:ring-primary-500 focus:ring-offset-2"
                >
                  <HiOutlineShoppingCart className="text-lg" />
                  Place Order
                </button>
              )}

              {/* Unavailable notice */}
              {canOrder && !isAvailable && (
                <div className="w-full flex items-center justify-center gap-2
                                bg-gray-100 text-gray-500 font-semibold py-3.5
                                rounded-xl text-base cursor-not-allowed">
                  <HiOutlineShoppingCart className="text-lg" />
                  Currently Unavailable
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3 text-base"
                >
                  <HiOutlineMail className="text-lg" />
                  Contact Seller
                </button>

                <button
                  type="button"
                  onClick={handleWishlist}
                  className={`flex items-center justify-center gap-2 py-3 px-5
                              rounded-xl font-semibold text-base border-2
                              transition-all duration-150
                              ${wishlisted
                                ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                : "bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500"
                              }`}
                  aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                >
                  {wishlisted
                    ? <><HiHeart className="text-xl text-red-500" /> Saved</>
                    : <><HiOutlineHeart className="text-xl" /> Save</>
                  }
                </button>
              </div>
            </div>

            {/* Back to marketplace */}
            <Link
              to={ROUTES.CROPS}
              className="flex items-center justify-center gap-2 text-sm text-gray-400
                         hover:text-primary-600 transition-colors"
            >
              <MdOutlineStorefront className="text-base" />
              Browse more listings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CropDetailPage;
