import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser"; // ✅ Import cookie-parser
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser()); // ✅ Enable cookie handling

app.use(cors({
    origin: "http://localhost:5173", // ✅ Adjust this based on frontend URL
    credentials: true, // ✅ Allow credentials (cookies)
}));

app.use(morgan('dev'));
app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.send('backend connected to front');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
