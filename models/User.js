const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide an email address"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

userSchema.pre("save", async function () {
  // console.log(this.modifiedPath());
  // console.log(this.isModified("name"));

  if(!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePass = async function (candidatePass) {
  const isMatch = await bcrypt.compare(candidatePass, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
