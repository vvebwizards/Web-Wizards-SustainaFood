import { Server } from "socket.io";
import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/helpers.js"; // Ensure you are using this correctly

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

    // ✅ **Send Email Notification**
    console.log("📧 Preparing email alert...");

    const mailOptions = {
      from: process.env.MAILER_EMAIL_ID,
      to: "soufien.baka2002@gmail.com", // Ensure recipient email is correct
      subject: "New Login Alert",
      html: `<p>Your account was accessed from a new device. If this wasn't you, please take action immediately.</p>`,
    };

    try {
      console.log("📧 Sending email to:", mailOptions.to);
      await sendEmail(mailOptions);
      console.log("✅ Email successfully sent!");
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError);
    }

  } catch (error) {
    console.error("❌ Error saving notification:", error);
  }
}

export default setupSocket;
