import express from "express";

import { signup,login,logout,updateUserInfo, getMe, 
  requestPasswordReset,resetPassword,
   sendOtp, updateTwoFaStatus,verifyEmail ,verifyTwoFa} from "../controllers/authController.js";

import upload from "../middleware/multerConfig.js";
import passport from "passport";
import { updateLastActive } from "../middleware/LastActive.js";
import jwt from "jsonwebtoken";

const router = express.Router();


router.post("/signup", updateLastActive, signup);
router.post("/login", updateLastActive, login);
router.post("/logout", updateLastActive, logout);
router.get("/me", updateLastActive, getMe);
router.post('/verify-2fa/:userId', verifyTwoFa);
router.post('/send-otp/:userId', updateLastActive, sendOtp);
router.post('/updatetwofa/:userId', updateLastActive, updateTwoFaStatus);
router.get("/verify-email", verifyEmail);
router.post("/request-reset", (req, res, next) => {
  console.log("🟢 Route /request-reset appelée !");
  next();
}, requestPasswordReset);
router.post("/reset-password", updateLastActive, resetPassword);
router.put("/update/:userId", updateLastActive, upload, updateUserInfo);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {

    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

export default router;
