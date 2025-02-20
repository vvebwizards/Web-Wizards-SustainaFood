import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import geoip from 'geoip-lite';
import crypto from 'crypto';
import {UAParser} from'ua-parser-js';
import deviceLocationLoginAlert from "../emailTemplates/deviceLocationLoginAlert.js";
import { sendEmail} from '../utils/helpers.js';
import { sendPasswordResetEmail } from "../utils/helpers.js"; // ✅ Import de la nouvelle fonction
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
export async function updateUserInfo(req, res) {
  try {
    const { userId } = req.params; // Assuming the user ID is passed as a URL parameter
    const { username, email, password } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update username if provided
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername && existingUsername._id.toString() !== userId) {
        return res.status(400).json({ message: "Username is already taken." });
      }
      user.username = username;
    }

    // Update email if provided
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== userId) {
        return res.status(400).json({ message: "Email is already in use." });
      }
      user.email = email;
    }

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    // Save the updated user information
    await user.save();

    res.status(200).json({ message: "User information updated successfully.", user });
  } catch (error) {
    console.error("Update User Info Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}


//reset password


export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    console.log("🔹 Email reçu pour reset:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Aucun utilisateur trouvé avec cet email.");
      return res.status(404).json({ message: "No user found with this email." });
    }
    // Générer un token sécurisé
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log("🔹 Lien de réinitialisation généré:", resetLink);

    const emailData = {
      from: process.env.MAILER_EMAIL_ID,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>If you did not request this, please ignore this email.</p>`,
    };

   
   //await sendPasswordResetEmail(emailData);
    await sendEmail(emailData);
    console.log("✅ Email de réinitialisation envoyé avec succès !");
    res.status(200).json({ message: "Reset link sent successfully!" });
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation du mot de passe:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Vérifie si le token est encore valide
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined; // Supprimer le token après usage
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
