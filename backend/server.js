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
import orderRoutes from "./routes/orderRoutes.js";
import quizRoutes from './routes/quizRoutes.js';
import statistics from './routes/statisticRoute.js';
import statsApi from './routes/adminStats.js';
import chatRoutes from './routes/chatRoutes.js';

import passport from "passport";
import "./passport.js"; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

connectDB();


// Configure CORS with allowed origins
const allowedOrigins = [
  'https://zealous-glacier-0b57ac403.6.azurestaticapps.net',
  'http://localhost:5173' // For local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.azurestaticapps.net')) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// Apply middleware
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle pre-flight requests
app.options('*', cors(corsOptions));

app.use(morgan("dev"));

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/auth/me", getMe);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/foodItem",FoodItemRoutes);
app.use('/api', statsApi);
app.use("/api/category",CategoryRoutes);
app.use('/api', quizRoutes);
app.use('/api/statistics', statistics);
app.use('/api/chat', chatRoutes);
app.use("/api/settings", settingsRoutes);
app.get("/", (req, res) => {
  res.send("Backend connected to frontend");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

setupSocket(server);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
export { app }; 