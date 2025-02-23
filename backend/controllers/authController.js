import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import geoip from 'geoip-lite';
import crypto from 'crypto';
import {UAParser} from'ua-parser-js';
import deviceLocationLoginAlert from "../emailTemplates/deviceLocationLoginAlert.js";
import { sendEmail} from '../utils/helpers.js';
import dotenv from 'dotenv';
import { sendNotification } from "../socket/socket.js"
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();


export async function signup(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userAgent = req.headers['user-agent'];
    const deviceFingerprint = crypto.createHash('sha256').update(userAgent).digest('hex');
    const newUser = new User({ username, email, password: hashedPassword, role });
    newUser.registeredDevices.push(deviceFingerprint);
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server error: Missing JWT_SECRET" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: false,
      maxAge: 60 * 60 * 1000, // 1 hour

    });

    const userData = { id: user._id, username: user.username, email: user.email, role: user.role };
    const userAgent = req.headers['user-agent']; 
    const deviceFingerprint = crypto.createHash('sha256').update(userAgent).digest('hex'); 

    // Parse device information
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();
    const deviceDetails = {
        browser: deviceInfo.browser.name,
        os: deviceInfo.os.name,
        device: deviceInfo.device.type || 'Desktop', 
    };
    
    const isRegisteredDevice = user.registeredDevices.includes(deviceFingerprint);

    if (!isRegisteredDevice) {
      await sendNotification(
        user._id,
        `New Login Alert: Your account was accessed from a new device : ${deviceDetails.device} on ${deviceDetails.browser} (${deviceDetails.os})`,
        req.io, 
        req.socketId 
      );
      const emailTemplate = deviceLocationLoginAlert(
        user.username,
        deviceDetails.device, 
        deviceDetails.browser,
        deviceDetails.os,
      );

      const mailOptions = {
        from: process.env.MAILER_EMAIL_ID,
        to: user.email, 
        subject: 'Login Alert',
        html: emailTemplate,
      };
      
     await sendEmail(mailOptions);
      
    }
       
    res.status(200).json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
}


// ✅ Logout function to clear cookie
export async function logout(req, res) {
  res.cookie("token", "", {
    httpOnly: false,
    maxAge: 60 * 60 * 1000,

  });

  res.status(200).json({ message: "Logged out successfully" });
}

export async function getMe(req, res) {
  try {
    // ✅ Extract token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // ✅ Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ✅ update user information
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function updateUserInfo(req, res) {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update username if provided
    if (req.body.username) {
      const existingUsername = await User.findOne({ 
        username: req.body.username,
        _id: { $ne: userId } // Exclude current user from check
      });
      
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken." });
      }
      user.username = req.body.username;
    }

    // Update email if provided
    if (req.body.email) {
      const existingEmail = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: userId } // Exclude current user from check
      });
      
      if (existingEmail) {
        return res.status(400).json({ message: "Email is already in use." });
      }
      user.email = req.body.email;
    }

    // Update password if provided
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    // Update profile image if provided
    if (req.file) {
      // Delete old profile image if it exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '..', user.profileImage);
        try {
          await fs.access(oldImagePath);
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.log('Old image not found or could not be deleted');
        }
      }

      // Update with new image path
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    // Save the updated user information
    const updatedUser = await user.save();

    // Remove sensitive information before sending response
    const userResponse = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role
    };

    res.status(200).json({ 
      message: "User information updated successfully.", 
      user: userResponse 
    });

  } catch (error) {
    console.error("Update User Info Error:", error);
    res.status(500).json({ 
      message: "Server error. Please try again later.",
      error: error.message 
    });
  }
}


