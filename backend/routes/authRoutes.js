import express from "express";
import { signup,login,logout,updateUserInfo} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update/:userId", updateUserInfo);
export default router;

