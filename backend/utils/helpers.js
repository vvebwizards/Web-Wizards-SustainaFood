
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
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

export const sendEmail = (data) => {
  return new Promise((resolve, reject) => {
    console.log(`📨 Tentative d'envoi d'email à: ${data.to}`);

    smtpTransport.sendMail(data, (err) => {
      if (err)
      { console.error("❌ Erreur lors de l'envoi de l'email:", err);

      reject(err); 
 } else{         console.log("✅ Email envoyé avec succès !", info.response);

  resolve(); }
    });
  });
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



