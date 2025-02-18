import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import geoip from 'geoip-lite';
import crypto from 'crypto';
import {UAParser} from'ua-parser-js';
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
    const ip = req.ip || req.connection.remoteAddress;
    const newUser = new User({ username, email, password: hashedPassword, role });
    newUser.registeredDevices.push(deviceFingerprint);
    newUser.registeredLocations.push(ip);
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

    // ✅ Set the token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "Strict", // Protects against CSRF
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    const userData = { id: user._id, username: user.username, email: user.email, role: user.role };
    const userAgent = req.headers['user-agent']; 
    const deviceFingerprint = crypto.createHash('sha256').update(userAgent).digest('hex'); 
    const ip = req.ip || req.connection.remoteAddress; 
 // Parse device information
        const parser = new UAParser(userAgent);
        const deviceInfo = parser.getResult();
        const deviceDetails = {
            browser: deviceInfo.browser.name,
            os: deviceInfo.os.name,
            device: deviceInfo.device.type || 'Desktop', 
        };

        // Get location information
        const location = geoip.lookup(ip);
        const locationDetails = location
            ? `${location.city}, ${location.region}, ${location.country}`
            : 'Unknown Location';
    const isRegisteredDevice = user.registeredDevices.includes(deviceFingerprint);
    const isRegisteredLocation = user.registeredLocations.includes(ip);

    if (!isRegisteredDevice ) {
      return res.status(403).json({
        success: false,
        message: `Connexion à partir d'un appareil non enregistré ${deviceDetails.device} sur ${deviceDetails.browser} (${deviceDetails.os})`,
      });
    }
    if (!isRegisteredLocation) {
      return res.status(403).json({
        success: false,
        message: `Connexion à partir d'un emplacement non enregistré ${locationDetails.city} , ${locationDetails.region} ,${locationDetails.country}`,
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
    expires: new Date(0), // ✅ Forces cookie expiration
  });

  res.status(200).json({ message: "Logged out successfully" });
}


