import express from "express";
import { markAsRead, getUserNotifications } from "../controllers/notificationController.js";

const router = express.Router();
router.get("/:userId", getUserNotifications);
router.put("/:notificationId/read", markAsRead);

export default router;
