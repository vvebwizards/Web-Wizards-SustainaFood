import { Server } from "socket.io";
import Notification from "../models/Notification.js"; 

let onlineUsers = new Map();

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 A user connected:", socket.id);

    socket.on("user_connected", async (userId) => {
      console.log(`✅ User ${userId} is online`);
      onlineUsers.set(userId, socket.id);

      try {
        // Debugging log before saving to DB
        console.log("📝 Creating notification in DB...");

        const notification = new Notification({
          userId,
          message: "Welcome to the app! This is a static notification.",
        });

        await notification.save();
        console.log("✅ Notification saved in DB!");

        io.to(socket.id).emit("new_notification", notification);
      } catch (error) {
        console.error("❌ Error saving notification:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 A user disconnected:", socket.id);
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      });
    });
  });

  return io;
};

export default setupSocket;
