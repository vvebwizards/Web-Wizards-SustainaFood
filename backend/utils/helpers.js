
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
    smtpTransport.sendMail(data, (err) => {
      if (err) reject(err); 
      else resolve(); 
    });
  });
};

