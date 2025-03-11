
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import User from "../models/User.js";
dotenv.config();

const {
  MAILER_EMAIL_ID: FROM_EMAIL,
  MAILER_PASSWORD: AUTH_PASSWORD,
  NODE_ENV,
  PRODUCTION_CLIENT_URL,
  DEVELOPMENT_CLIENT_URL,
  HOST,
  SECURE,
  PORT_SSL,
  MAILER_SERVICE_PROVIDER,
} = process.env;

const API_ENDPOINT =
  NODE_ENV === 'production' ? PRODUCTION_CLIENT_URL : DEVELOPMENT_CLIENT_URL;


const smtpTransport = nodemailer.createTransport({
  host: HOST,
  port: PORT_SSL,
  secure: SECURE,
  service: MAILER_SERVICE_PROVIDER,
  auth: {
    user: FROM_EMAIL,
    pass: AUTH_PASSWORD,
  },
  tls: {
        rejectUnauthorized: false,
  },
});


export async function getAuthenticatedUser(req) {
  const token = req.cookies.token;
  if (!token) throw new Error("Not authenticated");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");
  if (!user) throw new Error("User not found");

  return user;
}

export const sendEmail = async (mailOptions) => {
  try {
    console.log("📨 Preparing to send email with options:", mailOptions);

    const transporter = nodemailer.createTransport({
      service: "gmail", // Ensure this matches your provider
      auth: {
        user: process.env.MAILER_EMAIL_ID, // Check if correctly set in .env
        pass: process.env.MAILER_PASSWORD, // Check if correctly set in .env
      },
    });

    console.log("📡 Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};


//reset
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetLink = `${API_ENDPOINT}/reset-password?token=${resetToken}`;

    const emailData = {
      from: FROM_EMAIL,
      to: email,
      subject: "🔑 Password Reset Request",
      html: `
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Your Team</p>
      `,
    };

    await sendEmail(emailData);
    console.log(`✅ Reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending reset email:", error);
    throw new Error("Failed to send reset email.");
  }
};
// Envoi d’email de vérification
export const sendEmailVerification = async (user, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/confirm-email?token=${verificationToken}`;
  console.log("📧 Lien de vérification envoyé :", verificationLink);

  const emailData = {
    from: process.env.MAILER_EMAIL_ID,
    to: user.email,
    subject: "Verify Your Email",
    html: `
      <h2>Welcome, ${user.username}!</h2>
      <p>Click the button below to verify your email and activate your account:</p>
      <a href="${verificationLink}" style="display:inline-block; padding:10px 20px; background-color:green; color:white; text-decoration:none; border-radius:5px;">
        ✅ Verify Email
      </a>
      <p>If you did not sign up, please ignore this email.</p>
    `,
  };

  console.log("📡 Preparing to send email...");
  console.log("📧 Email Data:", emailData);

  try {
    await sendEmail(emailData);
    console.log("✅ Verification email sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
  }
};
