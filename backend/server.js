import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { getMe } from "./controllers/authController.js";
import setupSocket from "./socket/socket.js";
import FoodItemRoutes from "./routes/foodItemRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import CategoryRoutes from "./routes/CategoryRoutes.js"
import {refreshUserCronJobs} from './utils/scheduler.js';
// Import and initialize Passport for Google Auth
import passport from "passport";
import "./passport.js"; // This file contains your Passport Google strategy configuration

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

connectDB();

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(cookieParser());

// ✅ CORS Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  })
);

// ✅ Handle Preflight Requests for All Routes
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204); 
});

app.use(morgan("dev"));

app.use(passport.initialize());

refreshUserCronJobs();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/me", getMe);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/foodItem",FoodItemRoutes);
app.use("/api/category",CategoryRoutes);
app.use("/api/settings", settingsRoutes);
app.get("/", (req, res) => {
  res.send("Backend connected to frontend");
});

setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
