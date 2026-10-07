const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification");
const { authentication } = require("../middleware/authentication");

router.get("/api/notifications", authentication, notificationController.getNotifications);
router.put("/api/notifications/:notificationId/read", authentication, notificationController.markAsRead);
router.put("/api/notifications/read-all", authentication, notificationController.markAllAsRead);

module.exports = router;
