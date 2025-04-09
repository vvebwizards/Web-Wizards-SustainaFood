import express from "express";
import { getUsers, blockUser, deleteUser ,updatePassword} from "../controllers/userController.js";
import { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", isAdmin, getUsers);

router.put("/block/:id", isAdmin, blockUser);


router.delete("/:id", isAdmin, deleteUser);

router.put("/update-password/:userId",updatePassword);
export default router;
