import { useState, useRef } from "react";
import { HiOutlinePhotograph, HiX, HiOutlineUpload } from "react-icons/hi";
import { FaSeedling } from "react-icons/fa";
import InputField from "../common/InputField";
import Button from "../common/Button";
import Spinner from "../common/Spinner";
import { uploadImageToCloudinary } from "../../services/cropService";
import { getErrorMessage, capitalise } from "../../utils/helpers";

/**
 * CropForm — shared form for Add Crop and Edit Crop pages.
 *
 * Props:
 *  @param {Object}   initialData  Pre-populated values (Edit mode). Undefined in Add mode.
 *  @param {Function} onSubmit     Called with the assembled payload object on form submit.
 *  @param {boolean}  isSubmitting True while the parent is calling the API.
 *  @param {string}   submitLabel  Button label — "Create Listing" or "Save Changes".
 *  @param {Function} onCancel     Called when the user clicks Cancel.
 *
 * Image upload flow:
 *  1. User picks a file via the <input type="file">
 *  2. A local object URL previews it immediately (no network call yet)
 *  3. On form submit, if a new file was chosen, it uploads to Cloudinary
 *     and substitutes the result into the payload's `images` array.
 *  4. If no new file was chosen and an existing image URL exists (Edit mode),
 *     the existing image is kept in the payload untouched.
 *  5. If Cloudinary env vars are not configured, a helpful error is shown
 *     and the form does not submit.
 *
 * Validation:
 *  All validation is client-side first. The backend also validates — any
 *  backend error message is surfaced via the parent's error state.
 */

// ── Enums matching the Crop model exactly ────────────────────────────────────
const CATEGORIES = [
  "vegetables",
  "fruits",
  "grains",
  "pulses",
  "spices",
  "oilseeds",
  "dairy",
  "poultry",
  "other",
];

const UNITS = ["kg", "quintal", "ton", "bag", "dozen", "piece", "litre"];

// ── Blank form state ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  cropName:    "",
  category:    "",
  quantity:    "",
  unit:        "kg",
  price:       "",
  description: "",
  harvestDate: "",
  state:       "",
  district:    "",
  village:     "",
};

// ── Helper: convert ISO date to yyyy-MM-dd for <input type="date"> ─────────
const toDateInputValue = (isoString) => {
  if (!isoString) return "";
  return isoString.slice(0, 10);
};

const CropForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel  = "Create Listing",
  onCancel,
}) => {
  // ── Initialise form from existing data (Edit mode) or blank (Add mode) ────
  const [form, setForm] = useState(() => {
    if (!initialData) return EMPTY_FORM;
    return {
      cropName:    initialData.cropName    || "",
      category:    initialData.category    || "",
      quantity:    String(initialData.quantity ?? ""),
      unit:        initialData.unit        || "kg",
      price:       String(initialData.price ?? ""),
      description: initialData.description || "",
      harvestDate: toDateInputValue(initialData.harvestDate),
      state:       initialData.location?.state    || "",
      district:    initialData.location?.district || "",
      village:     initialData.location?.village  || "",
    };
  });

  const [errors,         setErrors]         = useState({});
  const [imageFile,      setImageFile]       = useState(null);   // new File chosen
  const [imagePreview,   setImagePreview]    = useState(        // preview URL
    initialData?.images?.[0]?.url || null
  );
  const [existingImage,  setExistingImage]   = useState(        // existing Cloudinary obj
    initialData?.images?.[0] || null
  );
  const [uploadingImage, setUploadingImage]  = useState(false);
  const [imageError,     setImageError]      = useState(null);

  const fileInputRef = useRef(null);

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Image file selection ──────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side type + size guard (5 MB max)
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file (JPG, PNG, WebP, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be smaller than 5 MB");
      return;
    }

    setImageError(null);
    setImageFile(file);
    // Instant local preview — no upload yet
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.cropName.trim())          e.cropName    = "Crop name is required";
    else if (form.cropName.trim().length < 2) e.cropName = "Crop name must be at least 2 characters";
    if (!form.category)                 e.category    = "Category is required";
    if (!form.quantity)                 e.quantity    = "Quantity is required";
    else if (isNaN(form.quantity) || Number(form.quantity) <= 0)
                                        e.quantity    = "Quantity must be a positive number";
    if (!form.unit)                     e.unit        = "Unit is required";
    if (!form.price)                    e.price       = "Price is required";
    else if (isNaN(form.price) || Number(form.price) < 0)
                                        e.price       = "Price must be 0 or more";
    if (!form.state.trim())             e.state       = "State is required";
    if (!form.district.trim())          e.district    = "District is required";
    return e;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorId = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // ── Upload image if a new file was chosen ─────────────────────────────
    let imagePayload = existingImage ? [existingImage] : [];

    if (imageFile) {
      setUploadingImage(true);
      setImageError(null);
      try {
        const uploaded = await uploadImageToCloudinary(imageFile);
        imagePayload = [uploaded];
      } catch (err) {
        setImageError(getErrorMessage(err));
        setUploadingImage(false);
        return; // Stop submit — don't call onSubmit with a broken image
      } finally {
        setUploadingImage(false);
      }
    }

    // ── Assemble payload matching backend schema ──────────────────────────
    const payload = {
      cropName:    form.cropName.trim(),
      category:    form.category,
      quantity:    Number(form.quantity),
      unit:        form.unit,
      price:       Number(form.price),
      description: form.description.trim(),
      harvestDate: form.harvestDate || null,
      images:      imagePayload,
      location: {
        state:    form.state.trim(),
        district: form.district.trim(),
        village:  form.village.trim(),
      },
    };

    onSubmit(payload);
  };

  const isBusy = isSubmitting || uploadingImage;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT COLUMN: main fields (spans 2/3 on lg) ───────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Section: Basic Details */}
          <div className="card flex flex-col gap-5">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Basic Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tell buyers about your crop</p>
            </div>

            <InputField
              id="cropName"
              name="cropName"
              label="Crop Name"
              placeholder="e.g. Basmati Rice, Cherry Tomatoes"
              value={form.cropName}
              onChange={handleChange}
              error={errors.cropName}
              required
              disabled={isBusy}
            />

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={isBusy}
                aria-invalid={!!errors.category}
                className={`input-field ${errors.category ? "border-red-400 focus:ring-red-400" : ""}`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{capitalise(c)}</option>
                ))}
              </select>
              {errors.category && (
                <p role="alert" className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={isBusy}
                placeholder="Describe your crop — quality, variety, growing method, etc."
                rows={3}
                maxLength={1000}
                className="input-field resize-none"
              />
              <p className="text-xs text-gray-400 text-right">
                {form.description.length}/1000
              </p>
            </div>
          </div>

          {/* Section: Quantity & Pricing */}
          <div className="card flex flex-col gap-5">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Quantity & Pricing</h2>
              <p className="text-xs text-gray-400 mt-0.5">Set how much you have and at what price</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="quantity"
                name="quantity"
                type="number"
                label="Available Quantity"
                placeholder="e.g. 500"
                value={form.quantity}
                onChange={handleChange}
                error={errors.quantity}
                required
                disabled={isBusy}
                min="0.1"
                step="0.1"
              />

              {/* Unit */}
              <div className="flex flex-col gap-1">
                <label htmlFor="unit" className="text-sm font-medium text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  disabled={isBusy}
                  className={`input-field ${errors.unit ? "border-red-400 focus:ring-red-400" : ""}`}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {errors.unit && (
                  <p role="alert" className="text-xs text-red-500">{errors.unit}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Price per {form.unit} (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                    ₹
                  </span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    disabled={isBusy}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    aria-invalid={!!errors.price}
                    className={`input-field pl-7 ${errors.price ? "border-red-400 focus:ring-red-400" : ""}`}
                  />
                </div>
                {errors.price && (
                  <p role="alert" className="text-xs text-red-500">{errors.price}</p>
                )}
              </div>

              <InputField
                id="harvestDate"
                name="harvestDate"
                type="date"
                label="Harvest Date"
                value={form.harvestDate}
                onChange={handleChange}
                disabled={isBusy}
              />
            </div>
          </div>

          {/* Section: Location */}
          <div className="card flex flex-col gap-5">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Location</h2>
              <p className="text-xs text-gray-400 mt-0.5">Where is this crop available for pickup?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="state"
                name="state"
                label="State"
                placeholder="e.g. Punjab"
                value={form.state}
                onChange={handleChange}
                error={errors.state}
                required
                disabled={isBusy}
              />
              <InputField
                id="district"
                name="district"
                label="District"
                placeholder="e.g. Amritsar"
                value={form.district}
                onChange={handleChange}
                error={errors.district}
                required
                disabled={isBusy}
              />
            </div>

            <InputField
              id="village"
              name="village"
              label="Village / Locality"
              placeholder="e.g. Majitha (optional)"
              value={form.village}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN: image upload ────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <div className="card flex flex-col gap-4">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Crop Photo</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                JPG, PNG or WebP · max 5 MB
              </p>
            </div>

            {/* Preview / Drop zone */}
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100">
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isBusy}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white
                             rounded-full flex items-center justify-center
                             hover:bg-red-700 transition-colors shadow-md"
                  aria-label="Remove image"
                >
                  <HiX className="text-sm" />
                </button>
                {imageFile && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40
                                  text-white text-xs px-3 py-1.5 text-center truncate">
                    {imageFile.name}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="flex flex-col items-center justify-center gap-3
                           border-2 border-dashed border-gray-200 rounded-xl
                           aspect-[4/3] bg-gray-50 hover:bg-primary-50
                           hover:border-primary-300 transition-all duration-200
                           cursor-pointer group"
                aria-label="Upload crop image"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200
                                flex items-center justify-center shadow-sm
                                group-hover:border-primary-300 transition-colors">
                  <HiOutlinePhotograph className="text-2xl text-gray-400 group-hover:text-primary-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-primary-600">
                    Click to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">or drag and drop</p>
                </div>
              </button>
            )}

            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isBusy}
              className="sr-only"
              aria-label="Choose image file"
            />

            {/* Change button when preview exists */}
            {imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="flex items-center justify-center gap-2 text-sm text-primary-600
                           font-medium hover:text-primary-700 transition-colors"
              >
                <HiOutlineUpload className="text-base" />
                Change Photo
              </button>
            )}

            {/* Upload in-progress */}
            {uploadingImage && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="w-4 h-4" />
                Uploading to Cloudinary…
              </div>
            )}

            {/* Image error */}
            {imageError && (
              <p role="alert" className="text-xs text-red-500">{imageError}</p>
            )}

            <p className="text-xs text-gray-400 leading-relaxed">
              A clear photo of your crop increases buyer confidence and helps
              your listing stand out in the marketplace.
            </p>
          </div>

          {/* Sticky action buttons on desktop */}
          <div className="card flex flex-col gap-3 lg:sticky lg:top-24">
            <Button
              type="submit"
              variant="primary"
              loading={isBusy}
              className="w-full"
            >
              <FaSeedling className={isBusy ? "hidden" : "text-base"} />
              {uploadingImage ? "Uploading image…" : isSubmitting ? "Saving…" : submitLabel}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                disabled={isBusy}
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default CropForm;
