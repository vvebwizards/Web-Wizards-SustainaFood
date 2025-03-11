import express from "express";
import { getUsers, blockUser, deleteUser } from "../controllers/userController.js";
import { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all users
router.get("/", isAdmin, getUsers);

// ✅ Block/Unblock a user
router.put("/block/:id", isAdmin, blockUser);

// ✅ Delete a user
router.delete("/:id", isAdmin, deleteUser);

export default router;
