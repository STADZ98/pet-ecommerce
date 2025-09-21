const express = require("express");
const router = express.Router();
const { authCheck } = require("../middlewares/authCheck");
const { getAdminProfile } = require("../controllers/admin");

const {
  getOrdersAdmin,
  changeOrderStatus,
  getSalesSummary,
  deleteUser,
  updateUserInfo,
  deleteOrder,
} = require("../controllers/admin");

const { updateOrderShipping } = require("../controllers/admin");
const { generateTrackingCode } = require("../controllers/admin");

router.put("/admin/order-status", authCheck, changeOrderStatus);
router.get("/admin/orders", authCheck, getOrdersAdmin);
router.get("/admin/sales-summary", authCheck, getSalesSummary);
router.delete("/admin/user/:id", authCheck, deleteUser);
router.patch("/admin/user/:id", authCheck, updateUserInfo);
router.get("/admin/profile", authCheck, getAdminProfile);
router.delete("/admin/order/:id", authCheck, deleteOrder);
router.put("/admin/order-shipping", authCheck, updateOrderShipping);
router.post("/admin/generate-tracking", authCheck, generateTrackingCode);

module.exports = router;
