import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { FaSeedling, FaMapMarkerAlt, FaCalendarAlt, FaBoxOpen } from "react-icons/fa";
import { MdOutlineStorefront } from "react-icons/md";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { fetchAllCrops, deleteCrop } from "../../services/cropService";
import { getErrorMessage, formatCurrency, formatDate, capitalise } from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";
import useAuth from "../../hooks/useAuth";

/**
 * MyCropsPage — displays only the logged-in farmer's crop listings.
 *
 * Route:  /crops/my
 * Access: Farmer only (enforced via ProtectedRoute in App.jsx)
 *
 * Data strategy:
 *  Calls GET /api/v1/crops (returns all available crops + farmer sees their own
 *  unavailable ones because the controller uses isAvailable: true for non-admins).
 *  Then filters client-side by crop.owner._id === user._id.
 *
 *  Note: A dedicated GET /crops/mine endpoint will be cleaner in a later phase.
 *  The current approach works correctly because farmers can see their own crops
 *  regardless of availability through getCropById, but getAllCrops only shows
 *  available ones. For now we show all crops where owner matches.
 *
 * Delete flow:
 *  1. User clicks Delete → confirmation modal appears
 *  2. User confirms → deleteCrop(id) → remove from local state immediately
 *  3. Toast success
 *  4. If error → toast error, keep list unchanged
 */

// ── Category colour pill (same as CropCard) ───────────────────────────────────
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
  "https://placehold.co/400x240/f0fdf4/16a34a?text=No+Image";

// ── Confirmation Modal ────────────────────────────────────────────────────────
const DeleteModal = ({ cropName, onConfirm, onCancel, isDeleting }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-modal-title"
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      aria-hidden="true"
    />
    {/* Panel */}
    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100
                    w-full max-w-sm p-6 flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <HiOutlineExclamationCircle className="text-2xl text-red-600" />
        </div>
        <div>
          <h2 id="delete-modal-title" className="font-bold text-gray-900 text-base">
            Delete Listing?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-700">"{cropName}"</span>?
            This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          loading={isDeleting}
          className="flex-1"
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
);

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                  overflow-hidden animate-pulse flex flex-col sm:flex-row">
    <div className="h-40 sm:h-auto sm:w-40 bg-gray-200 shrink-0" />
    <div className="flex-1 p-5 flex flex-col gap-3">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="flex gap-2 mt-auto">
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
        <div className="h-8 bg-gray-100 rounded-lg flex-1" />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const MyCropsPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [crops,       setCrops]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);  // { id, name }
  const [isDeleting,  setIsDeleting]  = useState(false);

  // ── Fetch + filter to this farmer ─────────────────────────────────────────
  const loadMyCrops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAllCrops();
      // Filter to only this farmer's listings
      const mine = res.data.crops.filter(
        (c) => c.owner?._id === user._id || c.owner?._id?.toString() === user._id?.toString()
      );
      setCrops(mine);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    loadMyCrops();
  }, [loadMyCrops]);

  // ── Delete handlers ───────────────────────────────────────────────────────
  const openDeleteModal  = (id, name) => setDeleteModal({ id, name });
  const closeDeleteModal = () => { if (!isDeleting) setDeleteModal(null); };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      await deleteCrop(deleteModal.id);
      // Optimistic update — remove from local state immediately
      setCrops((prev) => prev.filter((c) => c._id !== deleteModal.id));
      toast.success(`"${deleteModal.name}" deleted`);
      setDeleteModal(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Delete confirmation modal */}
      {deleteModal && (
        <DeleteModal
          cropName={deleteModal.name}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          isDeleting={isDeleting}
        />
      )}

      <div className="flex flex-col gap-6">

        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <MdOutlineStorefront className="text-2xl text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Crops</h1>
            </div>
            <p className="text-sm text-gray-500">
              {loading
                ? "Loading your listings…"
                : `${crops.length} listing${crops.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <Link
            to={ROUTES.CROP_CREATE}
            className="btn-primary inline-flex items-center gap-2 text-sm self-start sm:self-auto"
          >
            <HiOutlinePlus className="text-base" />
            Add New Crop
          </Link>
        </div>

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {!loading && error && (
          <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <FaSeedling className="text-2xl text-red-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Failed to load crops</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
            <Button variant="primary" onClick={loadMyCrops} className="text-sm px-6">
              Try Again
            </Button>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {!loading && !error && crops.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
              <FaSeedling className="text-4xl text-primary-300" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">No listings yet</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                Start selling by adding your first crop to the marketplace.
              </p>
            </div>
            <Link to={ROUTES.CROP_CREATE} className="btn-primary inline-flex items-center gap-2 text-sm">
              <HiOutlinePlus className="text-base" />
              Add Your First Crop
            </Link>
          </div>
        )}

        {/* ── Crop list ────────────────────────────────────────────────── */}
        {!loading && !error && crops.length > 0 && (
          <div className="flex flex-col gap-4">
            {crops.map((crop) => {
              const imageUrl  = crop.images?.[0]?.url || PLACEHOLDER_IMAGE;
              const catStyle  = CATEGORY_STYLES[crop.category] || CATEGORY_STYLES.other;
              const location  = [crop.location?.district, crop.location?.state]
                                  .filter(Boolean).join(", ");

              return (
                <article
                  key={crop._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm
                             hover:shadow-md transition-shadow duration-200
                             flex flex-col sm:flex-row overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="h-44 sm:h-auto sm:w-44 bg-gray-100 shrink-0 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={crop.cropName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col gap-2 min-w-0">

                    {/* Top row: name + status badge */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-gray-900 text-base leading-snug truncate">
                        {crop.cropName}
                      </h3>
                      <span
                        className={`shrink-0 text-xs font-semibold px-2.5 py-1
                                    rounded-full ${crop.isAvailable
                                      ? "bg-primary-100 text-primary-700"
                                      : "bg-gray-100 text-gray-500"
                                    }`}
                      >
                        {crop.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    {/* Category + price row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catStyle}`}>
                        {capitalise(crop.category)}
                      </span>
                      <span className="text-primary-600 font-bold">
                        {formatCurrency(crop.price)}
                        <span className="text-gray-400 font-normal text-xs ml-0.5">
                          /{crop.priceUnit || crop.unit}
                        </span>
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaBoxOpen className="text-gray-400" />
                        {crop.quantity} {crop.unit}
                      </span>
                      {location && (
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400" />
                        Listed {formatDate(crop.createdAt)}
                      </span>
                    </div>

                    {/* Action buttons — pushed to bottom */}
                    <div className="flex gap-2 mt-auto pt-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/crops/${crop._id}/edit`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5
                                   text-sm font-medium py-2 px-3 rounded-xl
                                   bg-blue-50 text-blue-700
                                   hover:bg-blue-600 hover:text-white
                                   transition-colors duration-150"
                        aria-label={`Edit ${crop.cropName}`}
                      >
                        <HiOutlinePencilAlt className="text-base" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(crop._id, crop.cropName)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5
                                   text-sm font-medium py-2 px-3 rounded-xl
                                   bg-red-50 text-red-600
                                   hover:bg-red-600 hover:text-white
                                   transition-colors duration-150"
                        aria-label={`Delete ${crop.cropName}`}
                      >
                        <HiOutlineTrash className="text-base" />
                        Delete
                      </button>

                      <Link
                        to={`/crops/${crop._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5
                                   text-sm font-medium py-2 px-3 rounded-xl
                                   bg-gray-50 text-gray-600
                                   hover:bg-gray-200
                                   transition-colors duration-150"
                        aria-label={`View ${crop.cropName} details`}
                      >
                        <MdOutlineStorefront className="text-base" />
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyCropsPage;
