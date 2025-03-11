import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["donor", "recipient", "volunteer", "admin"], 
    required: true
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
  otpExpires: { type: Date, default: null }, verificationToken: { type: String },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);