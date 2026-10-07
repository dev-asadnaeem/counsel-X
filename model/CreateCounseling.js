const mongoose = require("mongoose");

const createCounselingSchema = new mongoose.Schema(
  {
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
    },
    duration: {
      type: Number,
    },
    price: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("createCounseling", createCounselingSchema);
