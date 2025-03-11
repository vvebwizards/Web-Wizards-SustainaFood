import express from "express";

import { signup,login,logout,updateUserInfo, getMe, 
  requestPasswordReset,resetPassword, updatePhoneNumber,
   sendOtp, updateTwoFaStatus,verifyEmail } from "../controllers/authController.js";
import upload from "../middleware/multerConfig.js";
import passport from "passport";
import { updateLastActive } from "../middleware/LastActive.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);
router.put('/update-phone/:userId', updatePhoneNumber);
router.post('/send-otp/:userId', sendOtp);
router.post('/updatetwofa/:userId', updateTwoFaStatus);
router.get("/verify-email", verifyEmail);

//reset password

router.post("/request-reset", (req, res, next) => {
    console.log("🟢 Route /request-reset appelée !");
    next();
  }, requestPasswordReset);
  
//router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", updateLastActive,resetPassword);



router.put("/update/:userId", upload, updateUserInfo);
/*
router.post("/verify-email", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.userId, { isVerified: true });

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});
*/
export default router;

