const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    personalInfo: {
      type: Object,
      required: true,
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      password: {
        type: String,
        select: false,
      },
    },
    Token: {
      type: String,
    },
    TokenExpires: {
      type: Date,
    },
    role: { type: String, required: true },
    profile: { type: String },
    counseling: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "createCounseling",
    },
    status: {
      type: String,
      default: "active",
    },
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "counselorProfile",
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
