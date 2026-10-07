const express = require("express");
const profileController = require("../controller/profile");
const authentication = require("../middleware/authentication").authentication;
const uploadProfileAndFiles = require("../utils/multer").uploadProfileAndFiles;

const router = express.Router();

router.get("/api/profile", authentication, profileController.getProfile);
router.post(
  "/api/update-profile",
  authentication,
  uploadProfileAndFiles,
  profileController.putUpdateProfile
);

router.post(
  "/api/update-student-profile",
  authentication,
  uploadProfileAndFiles,
  profileController.postUpdateStudentProfile
);
module.exports = router;
