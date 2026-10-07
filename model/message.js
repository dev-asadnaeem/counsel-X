const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      // You can add validation for message content if needed
      // validate: [
      //   {
      //     validator: (value) => value.length > 0,
      //     message: "Message cannot be empty",
      //   },
      // ],
    },
    image: {
      type: String,
      default: null, // Default value can be null if there's no image
    },
    file: {
      type: String,
      default: null, // Default value can be null if there's no file
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // To automatically add createdAt and updatedAt fields
  }
);
module.exports = mongoose.model("Message", messageSchema);
