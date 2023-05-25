const productModel = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await productModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await productModel.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await productModel
    .findOne({ _id: productId })
    .populate("reviews");

  if (!product)
    throw new customError.NotFoundError(`No product with id: ${productId}`);

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await productModel.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product)
    throw new customError.NotFoundError(`No product with id: ${productId}`);

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await productModel.findOne({ _id: productId });

  if (!product)
    throw new customError.NotFoundError(`No product with id: ${productId}`);

  await product.deleteOne();

  res.status(StatusCodes.OK).json({ msg: "Success! Product Deleted." });
};

const uploadImage = async (req, res) => {
  if (!req.files) throw new customError.BadRequestError("No file uploaded!");

  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image"))
    throw customError.BadRequestError("Please upload image type file");

  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize)
    throw customError.BadRequestError("Please upload image smaller than 1MB");

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
