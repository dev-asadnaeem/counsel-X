const mongoose = require("mongoose");
const User = require("./User.js");
const message = require("./message.js");
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
  messages: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: message   // Reference to the Message model
    }
  ],
},{
    timestamps:true,
}); 
module.exports = mongoose.model("Conversation",conversationSchema)   