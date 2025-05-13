import { Server } from "socket.io";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/helpers.js";
import Message from "../models/Message.js";
import Room from "../models/Room.js";
import RoomMessage from "../models/RoomMessage.js"
let onlineUsers = new Map();

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://zealous-glacier-0b57ac403.6.azurestaticapps.net",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 A user connected:", socket.id);

    // Register user and join personal room
    socket.on("registerUser", (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.join(userId);
        console.log(`✅ User ${userId} registered with socket ID: ${socket.id}`);
      }
    });

    // Private 1-to-1 chat
    socket.on("privateMessage", async ({ recipientId, content, senderId }) => {
      try {
        const message = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content,
        });

        const recipientSocketId = onlineUsers.get(recipientId);

        // ✅ Only emit to recipient → sender updates UI locally
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("privateMessage", {
            senderId,
            recipientId,
            content,
          });
        }

        console.log(`💬 Sent private message from ${senderId} to ${recipientId}`);
      } catch (error) {
        console.error("❌ Error in privateMessage:", error);
      }
    });

    // Group chat
    socket.on("joinRoom", async ({ roomId }) => {
      socket.join(roomId);
      console.log(`👥 User ${socket.id} joined room ${roomId}`);
    });

    socket.on("sendMessage", async ({ roomId, content, senderId }) => {
      try {
        const saved = await RoomMessage.create({ sender: senderId, room: roomId, content });

        io.to(roomId).emit("newMessage", saved);

        console.log(`📣 Sent group message to room ${roomId}`);
      } catch (error) {
        console.error("❌ Error in sendMessage:", error);
      }
    });

    // Disconnect cleanup
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

    const notification = new Notification({ userId, message });
    await notification.save();

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
