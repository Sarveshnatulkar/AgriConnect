import api from "./api";

/**
 * Transport Service — wraps all transport-related API calls.
 */

/**
 * GET /api/v1/transport
 * Returns all open transport requests available to claim.
 */
export const fetchAvailableRequests = async () => {
  const response = await api.get("/transport");
  return response.data;
};

/**
 * GET /api/v1/transport/my
 * Returns all transport requests assigned to the authenticated transporter.
 */
export const fetchMyAssignments = async () => {
  const response = await api.get("/transport/my");
  return response.data;
};

/**
 * PATCH /api/v1/transport/:id/accept
 * Transporter accepts an open transport request.
 * @param {string} id - TransportRequest ObjectId
 */
export const acceptTransportRequest = async (id) => {
  const response = await api.patch(`/transport/${id}/accept`);
  return response.data;
};
