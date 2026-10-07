const mongoose = require("mongoose");

const counselorProfileSchema = new mongoose.Schema(
  {
    education: {
      type: Object,
      required: true,
      degree: {
        type: String,
      },
      institution: { type: String },
      experience: { type: String },
      description: { type: String },
    },
    payment: {
      type: Object,
      required: true,
      accountNumber: { type: String },
      bankName: { type: String },
      branchCode: { type: String },
    },
    file: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("counselorProfile", counselorProfileSchema);
