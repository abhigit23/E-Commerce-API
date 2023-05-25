const userModel = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const customErrorIndex = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyExists = await userModel.findOne({ email });

  if (emailAlreadyExists) {
    throw new customErrorIndex.BadRequestError("Email already exists!");
  }
  // first registered user as an admin
  const isFirstAccount = (await userModel.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await userModel.create({ name, email, password, role });
  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new customErrorIndex.BadRequestError(
      "Please provide email and password!"
    );

  const user = await userModel.findOne({ email });
  if (!user)
    throw new customErrorIndex.UnauthorizedError("Invalid Credentials");

  const isPassCorrect = await user.comparePass(password);
  if (!isPassCorrect)
    throw new customErrorIndex.UnauthorizedError("Invalid Credentials");

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res
    .cookie("token", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .status(StatusCodes.OK)
    .json({ msg: "User logged out!" });
};

module.exports = {
  register,
  login,
  logout,
};
