import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import crypto from 'crypto';
import { sendEmail } from '../utils/helpers.js';
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
    const defaultImage = "http://localhost:5000/../../frontend/src/assets/default_user_img.jpg"
    const newUser = new User({ username, email, password: hashedPassword, role, profileImage: defaultImage });
    newUser.registeredDevices.push(deviceFingerprint);
    await newUser.save();

    const newSettings = new Settings({
      userId: newUser._id,
      expiredNotifHour: 0,
      expiredNotifMinute: 0,
      expiredNotifDate: 1,
    });
    await newSettings.save();

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

    console.log("🔹 Generating JWT token...");
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("🔹 Setting cookie...");
    res.cookie("token", token, {
      httpOnly: false,
      maxAge: 60 * 60 * 1000,
    });

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      twofa: user.twofa,
      token: token
    };

    console.log("✅ Login successful for:", email);
    res.status(200).json({ message: "Login successful", user: userData });

    setTimeout(async () => {
      console.log("🚨 New device detected! Sending notification...");

      try {
        await sendNotification(
          user._id,
          `New Login Alert: Your account was accessed from a new device.`,
          req.io
        );
      } catch (notifError) {
        console.error("❌ Failed to send notification:", notifError);
      }
    }, 3000);

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
}

export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
}

export async function getMe(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log("🚨 No token found in cookies");
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("🚨 User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User session found:", user.email);
    res.status(200).json({ user });
  } catch (error) {
    console.log("🚨 Token expired or invalid:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function updateUserInfo(req, res) {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Mettre à jour le nom d'utilisateur
    if (req.body.username) {
      const existingUsername = await User.findOne({
        username: req.body.username,
        _id: { $ne: userId }
      });

      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken." });
      }
      user.username = req.body.username;
    }

    // Mettre à jour l'email
    if (req.body.email) {
      const existingEmail = await User.findOne({
        email: req.body.email,
        _id: { $ne: userId }
      });

      if (existingEmail) {
        return res.status(400).json({ message: "Email is already in use." });
      }
      user.email = req.body.email;
    }

    // Mettre à jour le mot de passe
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    // Mettre à jour l'image de profil (profileImage)
    if (req.files && req.files.profileImage) {
      const profileImageFile = req.files.profileImage[0]; // Prendre le premier fichier du tableau
      console.log('Profile image uploaded:', profileImageFile);

      // Supprimer l'ancienne image si elle existe
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '..', user.profileImage);
        try {
          await fs.access(oldImagePath);
          await fs.unlink(oldImagePath);
          console.log('Old profile image deleted:', oldImagePath);
        } catch (error) {
          console.error('Failed to delete old profile image:', error);
        }
      }

      // Mettre à jour le chemin de la nouvelle image
      user.profileImage = `/uploads/${profileImageFile.filename}`;
    }

    // Mettre à jour l'image supplémentaire (imageUrl)
    if (req.files && req.files.imageUrl) {
      const imageUrlFile = req.files.imageUrl[0]; // Prendre le premier fichier du tableau
      console.log('Image URL uploaded:', imageUrlFile);

      // Supprimer l'ancienne image si elle existe
      if (user.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', user.imageUrl);
        try {
          await fs.access(oldImagePath);
          await fs.unlink(oldImagePath);
          console.log('Old image URL deleted:', oldImagePath);
        } catch (error) {
          console.error('Failed to delete old image URL:', error);
        }
      }

      // Mettre à jour le chemin de la nouvelle image
      user.imageUrl = `/uploads/${imageUrlFile.filename}`;
    }

    // Sauvegarder les modifications
    const updatedUser = await user.save();
    console.log('User updated:', updatedUser);

    // Répondre avec les informations mises à jour
    const userResponse = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      imageUrl: updatedUser.imageUrl,
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

export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    console.log("🔹 Email reçu pour reset:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Aucun utilisateur trouvé avec cet email.");
      return res.status(404).json({ message: "No user found with this email." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
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
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("❌ Aucun utilisateur trouvé avec ce token dans la base.");
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }


    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);


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
    user.otpCode = otp;
    user.otpExpires = Date.now() + 3600000;
    await user.save();

    const emailData = {
      from: process.env.MAILER_EMAIL_ID,
      to: user.email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #2C3E50;">Hello ${user.username},</h2>
          <p>We received a request to access your account. Use the OTP code below to complete the process:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; padding: 12px 24px; font-size: 24px; color: #fff; background-color: #3498db; border-radius: 5px;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #999;">If you did not request this, please ignore this email.</p>
          <p style="font-size: 14px; color: #999;">This OTP code will expire in 1 hour.</p>
          <p style="font-size: 14px; color: #999;">Thank you,</p>
          <p style="font-size: 14px; color: #999;">The Web Wizards Team</p>
        </div>
      `,
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

export async function verifyTwoFa(req, res) {
  try {
    const { userId } = req.params;
    const { code } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otpCode === code) {
      user.twofa = true;
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();
      res.status(200).json(user);
    } else {
      res.status(400).json({ message: 'Invalid OTP code' });
    }
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ message: 'Failed to verify 2FA' });
  }
}

export const updateTwoFaStatus = async (req, res) => {
  console.log("🔹 Update 2FA function has been called");
  const { userId } = req.params;
  const { twofa, code } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (twofa) {
      if (user.otpCode === code) {
        user.twofa = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
      } else {
        return res.status(400).json({ message: 'Invalid OTP code' });
      }
    } else {
      user.twofa = false;
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating 2FA status:', error);
    res.status(500).json({ message: 'Failed to update 2FA status' });
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