const customErrorIndex = require("../errors");
const checkPermission = (requestUser, resourceUserId) => {
//   console.log(requestUser);
//   console.log(resourceUserId);
//   console.log(typeof resourceUserId);
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new customErrorIndex.UnauthorizedError(
    "Not authorized to access this route"
  );
};

module.exports = checkPermission;
