const express = require("express");
const router = express.Router();

const { authUser, authorizedPerms } = require("../middleware/authentication");
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

const { getSingleProductReviews } = require("../controllers/reviewController");

router
  .route("/")
  .post([authUser, authorizedPerms("admin")], createProduct)
  .get(getAllProducts);

router
  .route("/uploadImage")
  .post([authUser, authorizedPerms("admin")], uploadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authUser, authorizedPerms("admin")], updateProduct)
  .delete([authUser, authorizedPerms("admin")], deleteProduct);

router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
