const express = require("express");
const router = express.Router();
const { authUser, authorizedPerms } = require("../middleware/authentication");
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

router.route("/").get(authUser, authorizedPerms("admin"), getAllUsers);
router.route("/showMe").get(authUser, showCurrentUser);
router.route("/updateUser").patch(authUser, updateUser);
router.route("/updateUserPass").patch(authUser, updateUserPassword);
router.route("/:id").get(authUser, getSingleUser);

module.exports = router;
