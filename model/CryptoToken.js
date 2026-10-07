const mongoose = require("mongoose");

const cryptoSchema = new mongoose.Schema({
      token: {
        type: String,
        required: true,
      },
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
        },
      },
      education: {
        type: Object,
        degree: {
          type: String,
        },
        institution: { type: String },
        experience: { type: String },
        description: { type: String },
      },
      payment: {
        type: Object,
        accountNumber: { type: String },
        bankName: { type: String },
        branchCode: { type: String },
      },
      role: { 
        type: String, 
        required: true 
      },
      file: { type: String },
      counseling: {
        type: Object,
        category: { type: String },
        duration: { type: Number },
        price: { type: String },
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
      },
});

module.exports = new mongoose.model("crypto",cryptoSchema)
