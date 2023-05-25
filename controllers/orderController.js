const { StatusCodes } = require("http-status-codes");
const { checkPermission } = require("../utils");
const customError = require("../errors");
const orderModel = require("../models/Order");
const productModel = require("../models/Product");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const getAllOrders = async (req, res) => {
  const orders = await orderModel.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await orderModel.findOne({ _id: orderId });
  if (!order)
    throw new customError.NotFoundError(`No order found with id: ${orderId}`);

  checkPermission(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const userOrders = await orderModel.find({ user: req.user.userId });

  res.status(StatusCodes.OK).json({ userOrders, count: userOrders.length });
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1)
    throw new customError.BadRequestError("No cart items provided");

  if (!tax || !shippingFee)
    throw new customError.BadRequestError(
      "Please provide tax and shipping fee"
    );

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await productModel.findOne({ _id: item.product });
    if (!dbProduct)
      throw new customError.NotFoundError(
        `No product with id: ${item.product}`
      );

    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // add item to order
    orderItems = [...orderItems, singleOrderItem];
    // calculate subtotal
    subtotal += item.amount * price;
  }
  // calculate tatal
  const total = tax + shippingFee + subtotal;
  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "inr",
  });

  const order = await orderModel.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await orderModel.findOne({ _id: orderId });
  if (!order)
    throw new customError.NotFoundError(`No order found with id: ${orderId}`);

  checkPermission(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
