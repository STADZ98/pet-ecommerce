const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middlewares/authCheck");

const {
  listUsers,
  changeStatus,
  changeRole,
  userCart,
  getUserCart,
  emptyCart,
  saveAddress,
  getUserAddress,
  updateAddress,
  deleteAddress,
  saveOrder,
  getOrder,
  cancelOrder,
  returnOrder,
  uploadProfilePicture,
} = require("../controllers/user");

// 👤 User Management
router.get("/users", authCheck, adminCheck, listUsers);
router.post("/change-status", authCheck, adminCheck, changeStatus);
router.post("/change-role", authCheck, adminCheck, changeRole);

// 🛒 Cart
router.post("/user/cart", authCheck, userCart);
router.get("/user/cart", authCheck, getUserCart);
router.delete("/user/cart", authCheck, emptyCart);

// 📦 Order
router.post("/user/order", authCheck, saveOrder);
router.get("/user/order", authCheck, getOrder);
router.patch("/user/order/:id/cancel", authCheck, cancelOrder);

// 📦 Order (Return Product)
router.patch("/user/order/:id/return", authCheck, returnOrder);

// 📮 Address (CRUD)
router.post("/user/address", authCheck, saveAddress); // ✅ Create
router.get("/user/address", authCheck, getUserAddress); // ✅ Read (list)
router.put("/user/address/:id", authCheck, updateAddress); // ✅ Update
router.delete("/user/address/:id", authCheck, deleteAddress); // ✅ Delete

// 📸 Profile Picture
router.post("/user/profile-picture", authCheck, uploadProfilePicture);

module.exports = router;
