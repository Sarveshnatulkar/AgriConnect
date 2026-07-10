import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FaSeedling } from "react-icons/fa";
import toast from "react-hot-toast";
import CropForm from "../../components/crops/CropForm";
import { createCrop } from "../../services/cropService";
import { getErrorMessage } from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";

/**
 * AddCropPage — creates a new crop listing.
 *
 * Route:  /crops/new
 * Access: Farmer only (enforced via ProtectedRoute in App.jsx)
 *
 * Responsibilities:
 *  - Render page shell (header, breadcrumb)
 *  - Pass blank initialData (undefined) to CropForm
 *  - Call createCrop() with the assembled payload from CropForm
 *  - Show success toast and navigate to My Crops on success
 *  - Show error toast + inline error on failure
 */
const AddCropPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError,    setFormError]    = useState(null);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createCrop(payload);
      toast.success("Crop listing created successfully!");
      navigate(ROUTES.MY_CROPS);
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-gray-600 font-medium">Add New</span>
          </nav>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <FaSeedling className="text-primary-600 text-base" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Crop</h1>
              <p className="text-sm text-gray-500">Create a new listing for the marketplace</p>
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

      {/* ── Form ─────────────────────────────────────────────────────── */}
      <CropForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create Listing"
        onCancel={() => navigate(ROUTES.MY_CROPS)}
      />
    </div>
  );
};

export default AddCropPage;
