import express from "express";

import { signup,login,logout,updateUserInfo, getMe, requestPasswordReset,resetPassword, updatePhoneNumber, sendOtp, updateTwoFaStatus } from "../controllers/authController.js";
import upload from "../middleware/multerConfig.js";

import { updateLastActive } from "../middleware/LastActive.js";

const router = express.Router();

router.post("/signup",updateLastActive, signup);
router.post("/login",updateLastActive, login);
router.post("/logout",updateLastActive, logout);
router.get("/me",updateLastActive, getMe);
router.put('/update-phone/:userId',updateLastActive, updatePhoneNumber);
router.post('/send-otp/:userId',updateLastActive, sendOtp);
router.post('/updatetwofa/:userId',updateLastActive, updateTwoFaStatus);

//reset password

router.post("/request-reset", (req, res, next) => {
    console.log("🟢 Route /request-reset appelée !");
    next();
  }, requestPasswordReset);
  
//router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", updateLastActive,resetPassword);



router.put("/update/:userId", updateLastActive,upload, updateUserInfo);


export default router;

