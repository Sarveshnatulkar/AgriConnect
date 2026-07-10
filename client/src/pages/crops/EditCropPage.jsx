import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlinePencilAlt } from "react-icons/hi";
import toast from "react-hot-toast";
import CropForm from "../../components/crops/CropForm";
import Spinner from "../../components/common/Spinner";
import { fetchCropById, updateCrop } from "../../services/cropService";
import { getErrorMessage } from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";

/**
 * EditCropPage — loads an existing crop by :id and allows updating every
 * editable field including replacing the image.
 *
 * Route:  /crops/:id/edit
 * Access: Farmer only (enforced via ProtectedRoute)
 *
 * Load flow:
 *  1. On mount: fetchCropById(id) → store in `crop` state
 *  2. Pass `crop` as `initialData` to CropForm
 *  3. CropForm pre-fills all fields from initialData
 *
 * Submit flow:
 *  1. CropForm assembles the payload (uploads new image if chosen)
 *  2. Calls onSubmit(payload)
 *  3. This component calls updateCrop(id, payload)
 *  4. Success → toast + navigate to My Crops
 *  5. Error   → toast + inline error banner
 */
const EditCropPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [crop,         setCrop]         = useState(null);
  const [loadingCrop,  setLoadingCrop]  = useState(true);
  const [loadError,    setLoadError]    = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError,    setFormError]    = useState(null);

  // ── Load existing crop data ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingCrop(true);
      setLoadError(null);
      try {
        const res = await fetchCropById(id);
        setCrop(res.data.crop);
      } catch (err) {
        setLoadError(getErrorMessage(err));
      } finally {
        setLoadingCrop(false);
      }
    };
    load();
  }, [id]);

  // ── Update submission ─────────────────────────────────────────────────────
  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await updateCrop(id, payload);
      toast.success("Crop listing updated successfully!");
      navigate(ROUTES.MY_CROPS);
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingCrop) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Spinner size="w-10 h-10" />
        <p className="text-sm text-gray-500">Loading crop details…</p>
      </div>
    );
  }

  // ── Load error state ──────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center py-24 gap-4 text-center"
      >
        <p className="font-semibold text-gray-800">Failed to load crop</p>
        <p className="text-sm text-gray-500 max-w-sm">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-primary text-sm px-6"
        >
          Try Again
        </button>
        <Link to={ROUTES.MY_CROPS} className="text-sm text-gray-400 hover:text-primary-600">
          ← Back to My Crops
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2" aria-label="Breadcrumb">
            <Link to={ROUTES.FARMER_DASHBOARD} className="hover:text-primary-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to={ROUTES.MY_CROPS} className="hover:text-primary-600 transition-colors">
              My Crops
            </Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Edit</span>
          </nav>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <HiOutlinePencilAlt className="text-blue-600 text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit: {crop?.cropName}
              </h1>
              <p className="text-sm text-gray-500">Update your crop listing</p>
            </div>
          </div>
        </div>

        <Link
          to={ROUTES.MY_CROPS}
          className="inline-flex items-center gap-2 text-sm text-gray-500
                     hover:text-primary-600 transition-colors self-start sm:self-auto"
        >
          <HiOutlineArrowLeft className="text-base" />
          Back to My Crops
        </Link>
      </div>

      {/* ── Form-level error ─────────────────────────────────────────── */}
      {formError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-100 text-red-600 text-sm
                     px-4 py-3 rounded-xl"
        >
          {formError}
        </div>
      )}

      {/* ── Form pre-filled with existing data ──────────────────────── */}
      <CropForm
        initialData={crop}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
        onCancel={() => navigate(ROUTES.MY_CROPS)}
      />
    </div>
  );
};

export default EditCropPage;
