const userModel = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const customErrorIndex = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermission,
} = require("../utils");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await userModel.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await userModel
    .findOne({ _id: req.params.id })
    .select("-password");

  if (!user)
    throw new customErrorIndex.NotFoundError(`No user with ${req.params.id}`);

  checkPermission(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// Update user with user.save
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    throw new customErrorIndex.BadRequestError("Please provide all values");

  const user = await userModel.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPass, newPass } = req.body;
  if (!oldPass || !newPass)
    throw customErrorIndex.BadRequestError("Please provide both values");

  const user = await userModel.findOne({ _id: req.user.userId });

  const isPassCorrect = await user.comparePass(oldPass);
  if (!isPassCorrect)
    throw new customErrorIndex.UnauthorizedError("Invalid Credentials");

  user.password = newPass;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

// Update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { name, email } = req.body;
//   if (!name || !email)
//     throw new customError.BadRequestError(
//       "Please provide either name or email or both"
//     );

//   const user = await userModel.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };
