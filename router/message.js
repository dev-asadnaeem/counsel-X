const express = require("express");
const messages = require("../controller/message");
const authentication = require("../middleware/authentication").authentication;
const chatFiles = require("../utils/multer").ChatFiles;
const router = express.Router();

router.post("/api/send/:id", authentication, chatFiles, messages.postMessages);
router.get("/api/get/:id", authentication, messages.postGetMessages);

module.exports = router;
