const express = require("express");
const router = express.Router();
const { authUser, authorizedPerms } = require("../middleware/authentication");
const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require("../controllers/orderController");

router
  .route("/")
  .get(authUser, authorizedPerms("admin"), getAllOrders)
  .post(authUser, createOrder);

router.route("/showAllMyOrders").get(authUser, getCurrentUserOrders);

router.route("/:id").get(authUser, getSingleOrder).patch(authUser, updateOrder);

module.exports = router;
