import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"; // Import with 'import'

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.send('backend connected to front');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
