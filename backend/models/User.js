// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "" }, // Leave empty if using Google Auth
  role: { 
    type: String, 
    enum: ["donor", "recipient", "volunteer", "admin"], 
    required: true,
    default: "recipient"
  },
  blocked: { 
    type: Boolean, 
    default: false,
  },
  profileImage: { type: String, default: "" }, 
  registeredDevices: { type: [String], default: [] },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  phoneNumber: { type: String, default: "" },
  twofa: { type: Boolean, default: false },
  otpCode: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  lastActive: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  googleId: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
