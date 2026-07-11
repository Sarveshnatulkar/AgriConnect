import api from "./api";

/**
 * Crop Service — all crop-related API calls in one place.
 *
 * Every function returns response.data so callers work with
 * the payload directly, not the Axios response envelope.
 *
 * Response envelope shape (from backend):
 *   { success: boolean, message?: string, count?: number, data: { crop | crops } }
 */

// ─── READ ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/crops (with query params)
 * Supports server-side search, filters, sort, and pagination.
 */
export const fetchCrops = async (params = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
  const response = await api.get("/crops", { params: cleaned });
  return response.data;
};

/**
 * GET /api/v1/crops/my
 * Returns ALL crops owned by the logged-in farmer — no availability filter,
 * no pagination. Used exclusively by MyCropsPage and FarmerDashboard.
 */
export const fetchMyCrops = async () => {
  const response = await api.get("/crops/my");
  return response.data;
};

/**
 * GET /api/v1/crops (no params — kept for backwards compatibility)
 */
export const fetchAllCrops = async () => {
  const response = await api.get("/crops");
  return response.data;
};

/**
 * GET /api/v1/crops/featured
 * Returns up to 6 recently-listed available crops for the homepage.
 * Public endpoint — no auth cookie required.
 */
export const fetchFeaturedCrops = async () => {
  const response = await api.get("/crops/featured");
  return response.data;
};

/**
 * GET /api/v1/stats
 * Returns live platform statistics: farmers, buyers, listings, states.
 * Public endpoint — no auth cookie required.
 */
export const fetchPlatformStats = async () => {
  const response = await api.get("/stats");
  return response.data;
};

/**
 * GET /api/v1/crops/:id
 */
export const fetchCropById = async (id) => {
  const response = await api.get(`/crops/${id}`);
  return response.data;
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/crops
 */
export const createCrop = async (cropData) => {
  const response = await api.post("/crops", cropData);
  return response.data;
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * PUT /api/v1/crops/:id
 */
export const updateCrop = async (id, updates) => {
  const response = await api.put(`/crops/${id}`, updates);
  return response.data;
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/crops/:id
 */
export const deleteCrop = async (id) => {
  const response = await api.delete(`/crops/${id}`);
  return response.data;
};

// ─── CLOUDINARY UPLOAD ────────────────────────────────────────────────────────

/**
 * Uploads a single image file directly to Cloudinary from the browser.
 */
export const uploadImageToCloudinary = async (file) => {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || cloudName === "your_cloud_name") {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and " +
      "VITE_CLOUDINARY_UPLOAD_PRESET in your .env file."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "agriconnect/crops");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Image upload failed");
  }

  const data = await res.json();
  return {
    url:      data.secure_url,
    publicId: data.public_id,
  };
};
