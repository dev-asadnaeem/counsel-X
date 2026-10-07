const express = require("express");
const router = express.Router();
const studentController = require("../controller/student");
const authentication = require("../middleware/authentication").authentication;

router.get("/api/students", authentication, studentController.getStudent);


module.exports = router;
