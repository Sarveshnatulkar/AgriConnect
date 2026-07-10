import api from "./api";

/**
 * Order Service — wraps all order-related API calls.
 * Returns response.data so callers work with the payload directly.
 */

/**
 * POST /api/v1/orders
 * Buyer places an order.
 * @param {{ cropId, orderedQuantity, deliveryAddress?, buyerNote? }} data
 */
export const placeOrder = async (data) => {
  const response = await api.post("/orders", data);
  return response.data;
};

/**
 * GET /api/v1/orders/my
 * Returns all orders placed by the authenticated buyer.
 */
export const fetchMyOrders = async () => {
  const response = await api.get("/orders/my");
  return response.data;
};

/**
 * GET /api/v1/orders/received
 * Returns all orders received by the authenticated farmer.
 */
export const fetchReceivedOrders = async () => {
  const response = await api.get("/orders/received");
  return response.data;
};

/**
 * PATCH /api/v1/orders/:id/status
 * Farmer accepts or rejects an order.
 * @param {string} id
 * @param {{ status: "accepted"|"rejected", farmerNote?: string }} data
 */
export const updateOrderStatus = async (id, data) => {
  const response = await api.patch(`/orders/${id}/status`, data);
  return response.data;
};

/**
 * DELETE /api/v1/orders/:id
 * Buyer cancels a pending order.
 * @param {string} id
 */
export const cancelOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};
