
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", notificationController.getNotifications);
router.get("/unseen-count", notificationController.getUnseenCount);
router.patch("/seen-all", notificationController.markAllSeen);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);
module.exports = router;