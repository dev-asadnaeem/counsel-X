const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");
const authentication = require("../middleware/authentication").authentication;
const addBook = require("../utils/multer").AddBook;

router.get(
  "/api/toggleStatus/:Id",
  authentication,
  adminController.getToggleStatus
);
router.delete("/api/admin/delete-user/:Id", authentication, adminController.deleteUser);
router.post("/api/add-book", authentication, addBook, adminController.postAddBook);
router.get('/api/admin-stats', authentication, adminController.getAdminStats);
router.get('/api/get-books', authentication, adminController.getAllBooks);
router.get("/api/books/download/:bookId", authentication, adminController.downloadBook);
module.exports = router;
