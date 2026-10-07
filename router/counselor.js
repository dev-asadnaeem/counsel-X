const express = require("express");
const counselorController = require("../controller/counselor")
const authentication = require("../middleware/authentication").authentication
const createCounselingZodSchema = require("../zod-validation/zodCreateCounseling.js")
const zodValidation = require("../middleware/zodValidation.js").zodValidation
const router = express.Router();

router.get("/api/counselors", counselorController.getCounselor);
router.post("/api/buy-advice",authentication,counselorController.postCAdvice)
router.post("/api/create-counseling",authentication,zodValidation(createCounselingZodSchema),counselorController.postCreateCounseling)
router.get("/api/user/friends",authentication,counselorController.getUCounselors)
module.exports = router 