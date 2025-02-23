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
  console.log("🔹 Login request received:", req.body);

  try {
    const { email, password, captchaToken } = req.body;

    if (!email || !password || !captchaToken) {
      console.log("❌ Missing credentials or captchaToken");
      return res.status(400).json({ message: "Email, password, and captcha are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.blocked) {
      console.log("❌ Account is blocked for:", email);
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    console.log("🔹 Checking password...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password incorrect for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.log("❌ Missing JWT_SECRET in environment variables");
      return res.status(500).json({ message: "Server error: Missing JWT_SECRET" });
    }

    console.log("🔹 Generating JWT token...");
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("🔹 Setting cookie...");
    res.cookie("token", token, {
      httpOnly: true, // ✅ More secure, prevents XSS attacks
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: "Lax",
    });

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber
    };

    console.log("🔹 Checking registered devices...");
    const userAgent = req.headers['user-agent'];
    const deviceFingerprint = crypto.createHash('sha256').update(userAgent).digest('hex');

    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();
    const deviceDetails = {
      browser: deviceInfo.browser.name,
      os: deviceInfo.os.name,
      device: deviceInfo.device.type || 'Desktop',
    };

    const isRegisteredDevice = user.registeredDevices.includes(deviceFingerprint);

    // ✅ Handle notifications separately so login is NOT blocked
    if (!isRegisteredDevice) {
      console.log("🚨 New device detected! Sending notification...");

      // **Run notification logic asynchronously**
      (async () => {
        try {
          if (req.io && req.socketId) {
            console.log("🔹 Sending Socket.io notification...");
            await sendNotification(
              user._id,
              `New Login Alert: Your account was accessed from a new device: ${deviceDetails.device} on ${deviceDetails.browser} (${deviceDetails.os})`,
              req.io,
              req.socketId
            );
          } else {
            console.warn("⚠️ Socket ID or IO instance is missing, skipping notification.");
          }
        } catch (notifError) {
          console.error("❌ Failed to send notification:", notifError);
        }

        try {
          console.log("📧 Preparing email alert...");
          const emailTemplate = deviceLocationLoginAlert(
            user.username,
            deviceDetails.device,
            deviceDetails.browser,
            deviceDetails.os
          );

          const mailOptions = {
            from: process.env.MAILER_EMAIL_ID,
            to: user.email,
            subject: "Login Alert",
            html: emailTemplate,
          };

          console.log("📧 Sending email to:", user.email);
          await sendEmail(mailOptions);
        } catch (emailError) {
          console.error("❌ Failed to send email:", emailError);
        }
      })();
    }

    console.log("✅ Login successful for:", email);
    res.status(200).json({ message: "Login successful", user: userData });

  } catch (error) {
    console.error("❌ Login Error:", error);
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
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #2C3E50;"> Hi ${user.username},
        We've received a request to reset you password. Click the link below to reset your password:</h2>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #fff; background-color: #3498db; text-decoration: none; border-radius: 5px;">
            🔄Reset my password
          </a>
                  <p style="font-size: 14px; color: #999;">If you ignore this message, your password will not be changed.</p>

        </div>
 
      </div>
    `,
  };
     /* html: ` <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>If you did not request this, please ignore this email.</p>`,
    };
*/
/* /*
        <p style="font-size: 14px; color: #777;">Ou copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-wrap: break-word; color: #3498db;"><a href="${resetLink}">${resetLink}</a></p>
  
        
*/
   
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
    
    console.log("🟢 Reset Password Request Received:");
    console.log("Token:", token);
    console.log("New Password:", newPassword);

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Vérifie si le token est encore valide
    });

    if (!user) {
      console.log("❌ Aucun utilisateur trouvé avec ce token dans la base.");
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Supprimer le token après usage
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    console.log("✅ Mot de passe réinitialisé avec succès !");
    res.status(200).json({ message: "Password reset successful. You can now log in." });

  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation du mot de passe:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const updatePhoneNumber = async (req, res) => {
  const { userId } = req.params;
  const { phone } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.phoneNumber = phone;
    await user.save();
    res.json({ user });
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();

    const emailData = {
      from: process.env.MAILER_EMAIL_ID,
      to: user.email,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>
             <p>If you did not request this, please ignore this email.</p>`,
    };

    try {
      await sendEmail(emailData);
      console.log("✅ OTP email sent!");
      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error("❌ Error sending OTP email:", error);
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/*
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
*/