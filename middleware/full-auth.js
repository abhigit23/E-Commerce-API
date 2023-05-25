const { UnauthorizedError } = require("../errors");
const { isTokenValid } = require("../util/jwt");

const authenticateUser = async (req, res, next) => {
  let token;
  // check header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }
  // check cookies
  else if (req.cookies.token) token = req.cookies.token;

  if (!token) throw new UnauthorizedError("Invalid Authentication");

  try {
    const payload = isTokenValid(token);
    // Attach the user and his permissions to the req object
    req.user = { userId: payload.user.userId, role: payload.user.role };
    next();
  } catch (error) {
    throw new UnauthorizedError("Invalid Authentication");
  }
};
