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

export async function sendNotification(userId, message, io, socketId) {
  try {
    const notification = new Notification({ userId, message });
    await notification.save();
    console.log("✅ Notification saved in DB!");
    if (socketId) {
      io.to(socketId).emit("new_notification", notification);
    } else {
      console.error("❌ Socket ID is undefined.");
    }
  } catch (error) {
    console.error("❌ Error saving notification:", error);
  }
}


export default setupSocket;
