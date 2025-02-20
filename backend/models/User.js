import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["donor", "recipient", "volunteer"], 
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

}, { timestamps: true });

export default mongoose.model("User", userSchema);