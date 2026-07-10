import api from "./api";

/**
 * Admin Service — all admin API calls.
 * Every endpoint requires the admin role (enforced on the backend).
 */

// ── Stats ─────────────────────────────────────────────────────────────────────
export const fetchAdminStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const fetchAdminUsers = async (params = {}) => {
  const res = await api.get("/admin/users", { params });
  return res.data;
};

export const fetchAdminUserById = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const toggleUserStatus = async (id) => {
  const res = await api.patch(`/admin/users/${id}/toggle`);
  return res.data;
};

export const deleteAdminUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

// ── Crops ─────────────────────────────────────────────────────────────────────
export const fetchAdminCrops = async (params = {}) => {
  const res = await api.get("/admin/crops", { params });
  return res.data;
};

export const toggleCropAvailability = async (id) => {
  const res = await api.patch(`/admin/crops/${id}/toggle`);
  return res.data;
};

export const deleteAdminCrop = async (id) => {
  const res = await api.delete(`/admin/crops/${id}`);
  return res.data;
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const fetchAdminOrders = async (params = {}) => {
  const res = await api.get("/admin/orders", { params });
  return res.data;
};

// ── Transport ─────────────────────────────────────────────────────────────────
export const fetchAdminTransport = async (params = {}) => {
  const res = await api.get("/admin/transport", { params });
  return res.data;
};

export const completeTransportRequest = async (id) => {
  const res = await api.patch(`/admin/transport/${id}/complete`);
  return res.data;
};
