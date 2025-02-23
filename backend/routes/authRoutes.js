import express from "express";
import { signup,login,logout,updateUserInfo, getMe} from "../controllers/authController.js";
import upload from "../middleware/multerConfig.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);
router.put("/update/:userId", upload, updateUserInfo);


export default router;

