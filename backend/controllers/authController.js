import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import geoip from 'geoip-lite';
import crypto from 'crypto';
import {UAParser} from'ua-parser-js';
import deviceLocationLoginAlert from "../emailTemplates/deviceLocationLoginAlert.js";
import { sendEmail} from '../utils/helpers.js';
import dotenv from 'dotenv';
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
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
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
      const template = deviceLocationLoginAlert(
        user.username,
        deviceDetails.device, 
        deviceDetails.browser,
        deviceDetails.os,
      );

      const data = {
        from: process.env.MAILER_EMAIL_ID,
        to: user.email, 
        subject: 'Login Alert',
        html: template,
      };
      
      await sendEmail(data);
      
      return res.status(403).json({
        success: false,
        message: `Login from unregistered device: ${deviceDetails.device} on ${deviceDetails.browser} (${deviceDetails.os})`,
      });
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
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    expires: new Date(0), 
  });

  res.status(200).json({ message: "Logged out successfully" });
}


