const CustomAPIError = require("./custom-api");
const BadRequestError = require("./bad-request");
const UnauthorizedError = require("./unauthorized");
const NotFoundError = require("./not-found");
const ForbiddenError = require("./forbidden");

module.exports = {
  CustomAPIError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
};
