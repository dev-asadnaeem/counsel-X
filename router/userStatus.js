const express = require("express");
const router = express.Router();
const userStatusController = require("../controller/userStatus");
router.get("/api/user-status/:Id", userStatusController.getUserStatus);

module.exports = router;
