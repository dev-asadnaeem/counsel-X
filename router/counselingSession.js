const express = require("express");
const counselingSessionController = require("../controller/counselingSession");
const authentication = require("../middleware/authentication").authentication;
const zodValidation = require("../middleware/zodValidation").zodValidation;
const counselingSessionSchemaZod = require("../zod-validation/counselingSessionZod");
const router = express.Router();

router.get(
  "/api/counselorProfile/:counselorId",
  counselingSessionController.getCounselorProfile
);

router.post(
  "/api/counseling-schedule",
  authentication,
  zodValidation(counselingSessionSchemaZod),
  counselingSessionController.postscheduleCounseling
);

router.get(
  "/api/counseling-schedule/:counselorId",
  authentication,
  counselingSessionController.getscheduleCounseling
);

router.get(
  "/api/counselorAvailableSlots/:counselorId",
  counselingSessionController.getCounselorAvailableSlots
);

module.exports = router;
