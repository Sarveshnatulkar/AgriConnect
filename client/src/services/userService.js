import api from "./api";

/**
 * User Service — profile update and password change API calls.
 */

/**
 * PUT /api/v1/users/profile
 * Update name, phone, address, avatar (Cloudinary URL).
 * @param {{ name?, phone?, address?, avatar? }} data
 */
export const updateUserProfile = async (data) => {
  const response = await api.put("/users/profile", data);
  return response.data;
};

/**
 * PATCH /api/v1/users/password
 * Change password — requires current password for security.
 * @param {{ currentPassword, newPassword, confirmPassword }} data
 */
export const changeUserPassword = async (data) => {
  const response = await api.patch("/users/password", data);
  return response.data;
};
