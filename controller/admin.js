const UserSchema = require("../model/User");
const AdminBook = require("../model/AdminBook");
const CounselingSession = require("../model/counselingSession");
const CounselorProfile = require("../model/CounselorProfile");
const CreateCounseling = require("../model/CreateCounseling");
const Message = require("../model/message");
const Conversation = require("../model/conversation");
const Notification = require("../model/Notification");
const deleteFile = require("../utils/fileRemover");

exports.getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalCounselors, totalSessions, totalBooks, recentSessions] = await Promise.all([
      UserSchema.countDocuments({ role: "student" }),
      UserSchema.countDocuments({ role: "counselor" }),
      CounselingSession.countDocuments(),
      AdminBook.countDocuments(),
      CounselingSession.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("studentId", "personalInfo.name personalInfo.email profile")
        .populate("counselorId", "personalInfo.name personalInfo.email profile"),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCounselors,
        totalSessions,
        totalBooks,
        recentSessions,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};
exports.getToggleStatus = async (req, res, next) => {
  try {
    const { Id: studentId } = req.params;

    // Find the user by ID
    const user = await UserSchema.findById(studentId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Toggle the status between 'active' and 'disabled'
    const newStatus = user.status === "active" ? "disabled" : "active";

    // Update the user's status
    const updatedUser = await UserSchema.findByIdAndUpdate(
      studentId,
      { status: newStatus }, // Update status to the new status
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: `User status successfully updated to ${newStatus}`,
      success: true,
      user: updatedUser, // Optionally return the updated user data
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};

exports.postAddBook = async (req, res, next) => {
  try {
    const { bookTitle, bookDescription } = req.body;

    // Safely check for uploaded files
    const bookPdf = req.files?.["bookPdf"]?.[0]?.filename;
    const bookImage = req.files?.["bookImage"]?.[0]?.filename;

    // Validate all required fields
    if (!bookTitle || !bookDescription || !bookPdf || !bookImage) {
      deleteFile(bookPdf); // Await the deletion if the file exists
      deleteFile(bookImage); // Await the deletion if the file exists
      return res.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }

    // Save book to the database
    const bookAdded = await AdminBook.create({
      title: bookTitle,
      description: bookDescription, // Removed duplicate property
      pdfPath: bookPdf,
      imagePath: bookImage,
    });

    if (!bookAdded) {
      deleteFile(bookPdf); // Await the deletion if the file exists
      deleteFile(bookImage); // Await the deletion if the file exists
      return res.status(500).json({
        message: "Failed to add the book. Please try again.",
        success: false,
      });
    }

    // Respond with success
    res.status(200).json({
      message: "Book uploaded successfully!",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "An internal error occurred.",
      success: false,
      error,
    });
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    // Fetch all books from the database
    const books = await AdminBook.find();

    if (!books || books.length === 0) {
      return res.status(404).json({
        message: "No books found.",
        success: false,
      });
    }
    res.status(200).json({
      message: "Books fetched successfully!",
      success: true,
      data:books,
    });
  } catch (error) {
    res.status(500).json({
      message: "An internal error occurred.",
      success: false,
      error,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { Id: userId } = req.params;

    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // 1. Delete profile image file
    if (user.profile && user.profile !== "dummyImage.png") {
      deleteFile(user.profile);
    }

    // 2. If counselor: delete counselor profile (CV file) + counseling + sessions
    if (user.role === "counselor") {
      if (user.counselor) {
        const counselorProfile = await CounselorProfile.findById(user.counselor);
        if (counselorProfile && counselorProfile.file) {
          deleteFile(counselorProfile.file);
        }
        await CounselorProfile.findByIdAndDelete(user.counselor);
      }
      if (user.counseling) {
        await CreateCounseling.findByIdAndDelete(user.counseling);
      }
      await CounselingSession.deleteMany({ counselorId: userId });
    }

    // 3. If student: delete all sessions
    if (user.role === "student") {
      await CounselingSession.deleteMany({ studentId: userId });
    }

    // 4. Delete conversations & messages involving this user
    const conversations = await Conversation.find({ members: userId });
    const conversationIds = conversations.map((c) => c._id);
    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ members: userId });

    // 5. Delete notifications
    await Notification.deleteMany({ recipient: userId });

    // 6. Remove from friends lists of other users
    await UserSchema.updateMany(
      { friends: userId },
      { $pull: { friends: userId } }
    );

    // 7. Finally delete the user
    await UserSchema.findByIdAndDelete(userId);

    return res.status(200).json({
      message: `${user.role} deleted successfully`,
      success: true,
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

exports.downloadBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const fs = require("fs");
    const path = require("path");
    const AdminBook = require("../model/AdminBook");

    // Fetch book by database ID
    const book = await AdminBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found", success: false });
    }

    const filename = book.pdfPath;
    const filePath = path.join(__dirname, "../public/books", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server", success: false });
    }

    // Set CORS explicitly
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.sendFile(filePath, {
      headers: {
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Type": "application/pdf"
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
