// src/services/emailService.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export const sendDownAlert = async (to: string, monitorUrl: string) => {
  await transporter.sendMail({
    from: '"Uptime Monitor" <alerts@yourapp.com>',
    to,
    subject: `🔴 ${monitorUrl} is DOWN`,
    text: `Heads up! Your monitor at ${monitorUrl} is not responding.`,
  });
};
