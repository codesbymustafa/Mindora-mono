import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read", markAsRead);
router.delete("/delete/:notificationId", deleteNotification);

export default router;