const MessageSchema = require("../model/message.js");
const Conversation = require("../model/conversation");

exports.postMessages = async (req, res, next) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { message, createdAt } = req.body;

    // Access uploaded file path filenames if they exist
    const imageFilename = req.files?.chatImage?.[0]?.filename;
    const fileFilename = req.files?.chatFile?.[0]?.filename;

    // Calculate room for path construction
    const room = [senderId.toString(), receiverId.toString()].sort().join("-");
    const imagePath = imageFilename ? `chat/${room}/Images/${imageFilename}` : null;
    const filePath = fileFilename ? `chat/${room}/Files/${fileFilename}` : null;

    // Create conversation if it doesn't exist
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create a new message schema
    const newMessage = new MessageSchema({
      senderId: senderId,
      receiverId: receiverId,
      message: message.trim(),
      image: imagePath, // Attach full relative path if it exists
      file: filePath, // Attach full relative path if it exists
      createdAt,
    });

    // Save the new message to the conversation
    if (newMessage) {
      conversation.messages.push(newMessage._id);
      await conversation.save();
    }

    // Save the message to the database
    await newMessage.save();

    return res.status(201).json({
      message: "Message added to conversation successfully",
      data: newMessage,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while posting messages", success: false });
  }
};

exports.postGetMessages = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");
    if (!conversation) {
      return res
        .status(404)
        .json({ data: [], success: true, message: "conversion is not exist" });
    }
    return res.status(201).json({
      message: "fetch all messages from conversation",
      data: conversation.messages,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error fetch messages", success: false });
  }
};
