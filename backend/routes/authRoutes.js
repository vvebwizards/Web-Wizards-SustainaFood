import express from "express";

import { signup,login,logout,updateUserInfo, getMe, requestPasswordReset,resetPassword, updatePhoneNumber, sendOtp, updateTwoFaStatus } from "../controllers/authController.js";
import upload from "../middleware/multerConfig.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);
router.put('/update-phone/:userId', updatePhoneNumber);
router.post('/send-otp/:userId', sendOtp);
router.post('/updatetwofa/:userId', updateTwoFaStatus);

//reset password

router.post("/request-reset", (req, res, next) => {
    console.log("🟢 Route /request-reset appelée !");
    next();
  }, requestPasswordReset);
  
//router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);



router.put("/update/:userId", upload, updateUserInfo);


export default router;

