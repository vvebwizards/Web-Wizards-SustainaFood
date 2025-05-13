import { io } from "socket.io-client";

const socket = io("https://foodreduce-backend.azurewebsites.net");

socket.on("connect", () => {
  console.log("🟢 Connected to WebSocket server!");
  const testUserId = "67b60ce53b1605ee7cdc0af6"; 
  socket.emit("user_connected", testUserId);
  console.log("📢 Sent user_connected event with userId:", testUserId);
});

socket.on("new_notification", (notification) => {
  console.log("🔔 New Notification Received:", notification);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from server");
});
