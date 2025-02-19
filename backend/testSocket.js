import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("🟢 Connected to WebSocket server!");

  // Emit user_connected event after connecting
  const testUserId = "67b60ce53b1605ee7cdc0af6"; // Replace with a valid userId
  socket.emit("user_connected", testUserId);
  console.log("📢 Sent user_connected event with userId:", testUserId);
});

socket.on("new_notification", (notification) => {
  console.log("🔔 New Notification Received:", notification);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from server");
});
