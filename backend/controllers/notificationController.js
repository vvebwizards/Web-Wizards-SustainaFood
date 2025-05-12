import Notification from "../models/Notification.js"; 

export async function getUserNotifications  (req, res) {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

export async function markAsRead  (req, res)  {
  try {
    await Notification.findByIdAndUpdate(req.params.notificationId, { isRead: true });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Error marking notification as read" });
  }
};
