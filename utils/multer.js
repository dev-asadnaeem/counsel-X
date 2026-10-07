const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Define storageForProfile for files (images and PDFs)
const storageForProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    // Separate directories for images and PDFs
    if (file.mimetype === "application/pdf") {
      cb(null, "public/files"); // Directory for PDF files
    } else if (file.mimetype.startsWith("image")) {
      cb(null, "public/images"); // Directory for images
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Define storageForBook files (images and PDFs)
const storageForBook = multer.diskStorage({
  destination: (req, file, cb) => {
    // Separate directories for images and PDFs
    if (file.mimetype === "application/pdf") {
      cb(null, "public/books"); // Directory for PDF files
    } else if (file.mimetype.startsWith("image")) {
      cb(null, "public/BImages"); // Directory for images
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const chatPdfFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only PDF files are allowed!"), false); // Reject the file
  }
};

// Define custom storage for the chat files
const storageForChat = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user._id; // Assuming you have userId in req.user
    const chatUserId = req.params.id; // Get chatUserId from the route parameter
    const room = [userId, chatUserId].sort().join("-"); // Unique room based on userId and chatUserId

    // Define folder paths for files and images
    const folderPathForFile = path.join("public/chat", `${room}/Files`);
    const folderPathForImage = path.join("public/chat", `${room}/Images`);

    // Ensure that both file and image directories exist, create them if not
    fs.mkdirSync(folderPathForFile, { recursive: true });
    fs.mkdirSync(folderPathForImage, { recursive: true });

    // Allowed file types for files
    const allowedFileTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    // If the file type is allowed (e.g., PDFs), save it to the Files directory, else check for images
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, folderPathForFile); // Directory for PDF files
    } else if (file.mimetype.startsWith("image")) {
      cb(null, folderPathForImage); // Directory for images
    }
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with a timestamp
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Image filter to allow only JPEG, JPG, PNG
const imageFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, and PNG formats are allowed!"), false);
  }
};

// File filter to allow only PDFs
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only PDF files are allowed!"), false); // Reject the file
  }
};

// Define upload middleware to handle both image and file (PDF)
const uploadProfileAndFiles = multer({
  storage: storageForProfile,
  limits: {
    fileSize: 1024 * 1024 * 15, // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    // Determine the filter based on file type
    if (file.mimetype.startsWith("image")) {
      imageFilter(req, file, cb); // Use image filter for images
    } else if (file.mimetype === "application/pdf") {
      chatPdfFilter(req, file, cb); // Use PDF filter for PDFs
    } else {
      cb(new Error("Unsupported file format!"), false);
    }
  },
}).fields([
  { name: "profileImage", maxCount: 1 }, // Single profile image upload
  { name: "file", maxCount: 1 }, // Single PDF upload
]);

// Define upload middleware to handle both image and file (PDF)
const AddBook = multer({
  storage: storageForBook,
  limits: {
    fileSize: 1024 * 1024 * 50, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Determine the filter based on file type
    if (file.mimetype.startsWith("image")) {
      imageFilter(req, file, cb); // Use image filter for images
    } else if (file.mimetype === "application/pdf") {
      pdfFilter(req, file, cb); // Use PDF filter for PDFs
    } else {
      cb(new Error("Unsupported file format!"), false);
    }
  },
}).fields([
  { name: "bookImage", maxCount: 1 }, // Single profile image upload
  { name: "bookPdf", maxCount: 1 }, // Single PDF upload
]);

const ChatFiles = multer({
  storage: storageForChat,
  limits: {
    fileSize: 1024 * 1024 * 50, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Determine the filter based on file type
    if (file.mimetype.startsWith("image")) {
      imageFilter(req, file, cb); // Use image filter for images
    } else if (
      file.mimetype === "application/pdf" ||
      "application/msword" ||
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      "application/vnd.ms-excel" ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      "text/plain"
    ) {
      chatPdfFilter(req, file, cb); // Use PDF filter for PDFs
    } else {
      cb(new Error("Unsupported file format!"), false);
    }
  },
}).fields([
  { name: "chatFile", maxCount: 1 }, // Single profile image upload
  { name: "chatImage", maxCount: 1 }, // Single PDF upload
]);

module.exports = {
  uploadProfileAndFiles,
  AddBook,
  ChatFiles,
};
