const express = require("express");
const router = express.Router();
const { authUser } = require("../middleware/authentication");
const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { route } = require("express/lib/router");

router.route("/").post(authUser, createReview).get(getAllReviews);
router
  .route("/:id")
  .get(getSingleReview)
  .patch(authUser, updateReview)
  .delete(authUser, deleteReview);

module.exports = router;
