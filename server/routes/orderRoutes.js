const express = require("express");
const router  = express.Router();

const {
  placeOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const { protect }   = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

/**
 * Order Routes — mounted at /api/v1/orders in routes/index.js
 *
 * POST   /api/v1/orders                  placeOrder       (buyer)
 * GET    /api/v1/orders/my               getMyOrders      (buyer)
 * GET    /api/v1/orders/received         getFarmerOrders  (farmer)
 * PATCH  /api/v1/orders/:id/status       updateOrderStatus (farmer)
 * DELETE /api/v1/orders/:id              cancelOrder      (buyer)
 *
 * Route ordering: /my and /received MUST come before /:id
 * so Express doesn't treat "my" or "received" as a dynamic id.
 */

router.post(  "/",                protect, authorize("buyer"),   placeOrder);
router.get(   "/my",              protect, authorize("buyer"),   getMyOrders);
router.get(   "/received",        protect, authorize("farmer"),  getFarmerOrders);
router.patch( "/:id/status",      protect, authorize("farmer"),  updateOrderStatus);
router.delete("/:id",             protect, authorize("buyer"),   cancelOrder);

module.exports = router;
