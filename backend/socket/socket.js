import { Server } from "socket.io";
import Notification from "../models/Notification.js";
import User from "../models/User.js"; // Import User model to fetch email
import { sendEmail } from "../utils/helpers.js";

let onlineUsers = new Map(); // Store { userId: socketId }

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 A user connected:", socket.id);

    socket.on("registerUser", (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        console.log(`✅ User ${userId} registered with socket ID: ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 A user disconnected:", socket.id);
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`❌ User ${userId} removed from online users.`);
        }
      });
    });
  });

  return io;
};

export async function sendNotification(userId, message, io) {
  try {
    if (!userId || !message) {
      console.error("❌ Missing userId or message for notification.");
      return;
    }

    console.log(`🔹 Saving notification to DB for user ${userId}...`);

    // ✅ Save notification in MongoDB
    const notification = new Notification({ userId, message });

    await notification
      .save()
      .then(() => console.log("✅ Notification successfully saved in DB!"))
      .catch((err) => console.error("❌ DB Save Error:", err));

    // ✅ Get the socket ID dynamically
    const socketId = onlineUsers.get(userId);

    if (socketId) {
      io.to(socketId).emit("new_notification", notification);
      console.log(`📨 Notification sent via WebSocket to user ${userId} (Socket: ${socketId})`);
    } else {
      console.warn(`⚠️ User ${userId} is offline. Notification stored in DB.`);
    }

  } catch (error) {
    console.error("❌ Error saving notification:", error);
  }
}

export default setupSocket;
