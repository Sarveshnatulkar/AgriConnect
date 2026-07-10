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
 * GET /api/v1/crops
 * Returns all available crops (isAvailable: true for regular users).
 * Admins see all regardless of availability.
 */
export const fetchAllCrops = async () => {
  const response = await api.get("/crops");
  return response.data;
};

/**
 * GET /api/v1/crops/:id
 * Returns a single crop by MongoDB ObjectId.
 * @param {string} id
 */
export const fetchCropById = async (id) => {
  const response = await api.get(`/crops/${id}`);
  return response.data;
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/crops
 * Creates a new crop listing. Farmer only.
 *
 * @param {Object} cropData - Must include: cropName, category, quantity, unit,
 *                            price, location.state, location.district
 *                            Optional: description, harvestDate, images
 */
export const createCrop = async (cropData) => {
  const response = await api.post("/crops", cropData);
  return response.data;
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * PUT /api/v1/crops/:id
 * Updates an existing crop. Owner or admin only.
 * Only sends fields that are present in `updates` (partial update).
 *
 * @param {string} id
 * @param {Object} updates - Any subset of crop fields
 */
export const updateCrop = async (id, updates) => {
  const response = await api.put(`/crops/${id}`, updates);
  return response.data;
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/crops/:id
 * Hard-deletes a crop. Owner or admin only.
 *
 * @param {string} id
 */
export const deleteCrop = async (id) => {
  const response = await api.delete(`/crops/${id}`);
  return response.data;
};

// ─── CLOUDINARY UPLOAD ────────────────────────────────────────────────────────

/**
 * Uploads a single image file directly to Cloudinary from the browser.
 *
 * Why upload from the browser instead of the backend?
 *  - No file storage needed on the server
 *  - Reduces backend load and eliminates multer complexity
 *  - Cloudinary receives the file directly — no round-trip through Express
 *  - Standard production pattern for JAMstack / MERN apps
 *
 * Requires two env vars:
 *   VITE_CLOUDINARY_CLOUD_NAME   — your Cloudinary cloud name
 *   VITE_CLOUDINARY_UPLOAD_PRESET — an UNSIGNED upload preset (created in
 *                                    Cloudinary dashboard → Settings → Upload)
 *
 * Returns:
 *   { url: string, publicId: string }  — ready to store in the crop.images array
 *
 * @param {File} file - A browser File object from an <input type="file">
 * @returns {Promise<{ url: string, publicId: string }>}
 * @throws {Error} if env vars are missing or upload fails
 */
export const uploadImageToCloudinary = async (file) => {
  const cloudName   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
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
