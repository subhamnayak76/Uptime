import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service :"Gmail",
  auth: {
    user: process.env.NAME,
    pass:  process.env.PASS,
  },
});

export const sendDownAlert = async (to: string, monitorUrl: string) => {
  await transporter.sendMail({
    from: 'Uptime Monitor',
    to,
    subject: ` ${monitorUrl} is DOWN`,
    text: `Heads up! Your monitor at ${monitorUrl} is not responding.`,
  });
};
