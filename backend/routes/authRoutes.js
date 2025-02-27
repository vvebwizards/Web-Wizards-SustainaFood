import express from "express";

import { signup,login,logout,updateUserInfo, getMe, requestPasswordReset,resetPassword, updatePhoneNumber, sendOtp, updateTwoFaStatus } from "../controllers/authController.js";
import upload from "../middleware/multerConfig.js";
import passport from "passport";
import { updateLastActive } from "../middleware/LastActive.js";
import jwt from "jsonwebtoken";

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






// Initiate Google authentication and request profile & email
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

// Callback URL after user signs in with Google
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Generate a JWT token for the authenticated user
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Set the token in a secure, HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    
    // Redirect to your frontend, e.g., to the dashboard
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);




export default router;

