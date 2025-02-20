import express from "express";
import http from "http"; // ✅ Import HTTP module
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"; 
import { getMe } from "./controllers/authController.js";
import setupSocket from "./socket/socket.js"

dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app); // ✅ Create HTTP server

connectDB();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(morgan("dev"));


app.use("/api/auth", authRoutes);
app.use("/api/auth/me", getMe);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Backend connected to frontend");
});

setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
