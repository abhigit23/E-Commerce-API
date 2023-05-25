const customError = require("../errors");
const { isTokenValid } = require("../utils");

const authUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) throw new customError.UnauthorizedError("Invalid Authentication");

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new customError.UnauthorizedError("Invalid Authentication");
  }
};

const authorizedPerms = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new customError.ForbiddenError(
        "Unauthorized to access this route!"
      );
    next();
  };
};

module.exports = {
  authUser,
  authorizedPerms,
};
