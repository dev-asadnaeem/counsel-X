const express = require("express");
const authController = require("../controller/auth");
const authentication = require("../middleware/authentication").authentication;
const zodUser = require("../zod-validation/zodUser");
const zodCounselorProfile = require("../zod-validation/zodCounselorProfile");
const zodValidator = require("../middleware/zodValidation").zodRegistrationValidation;
const uploadProfileAndFiles = require("../utils/multer").uploadProfileAndFiles;
const router = express.Router();

router.post("/api/login", authController.postLogin);
router.get("/api/register/verify/:token", authController.getVerify);
router.post(
  "/api/register",
  uploadProfileAndFiles,
  zodValidator(zodUser, zodCounselorProfile),
  authController.postRegister
);
// Student registration without file uploads
router.post(
  "/api/register/student",
  zodValidator(zodUser, zodCounselorProfile),
  authController.postRegister
);
router.get("/api/user", authentication, authController.getUser); 
router.post("/api/email-reset", authController.postEmailResetPassword)
router.post("/api/password-reset", authController.postResetPassword)

module.exports = router;
