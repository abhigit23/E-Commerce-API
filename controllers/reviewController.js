const { StatusCodes } = require("http-status-codes");
const reviewModel = require("../models/Review");
const productModel = require("../models/Product");
const { checkPermission } = require("../utils");
const customError = require("../errors");

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isValidProduct = await productModel.findOne({ _id: productId });

  if (!isValidProduct)
    throw new customError.NotFoundError(`No product with id: ${productId}`);

  const alreadySubmitted = await reviewModel.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted)
    throw new customError.BadRequestError(
      "Already submitted review for this product"
    );

  req.body.user = req.user.userId;
  const review = await reviewModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await reviewModel.find({}).populate({
    path: "product",
    select: "name company price",
  });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await reviewModel.findOne({ _id: reviewId });

  if (!review)
    throw new customError.NotFoundError(`No review found with id ${reviewId}`);

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await reviewModel.findOne({ _id: reviewId });

  if (!review)
    throw new customError.NotFoundError(`No review found with id ${reviewId}`);

  checkPermission(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await reviewModel.findOne({ _id: reviewId });

  if (!review)
    throw new customError.NotFoundError(`No review with ${reviewId} found!`);

  checkPermission(req.user, review.user);
  await review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Success! Review Deleted" });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await reviewModel.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews
};
