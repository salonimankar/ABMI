import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function sendTestEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports like 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: "your-email@gmail.com", // change to your email
      subject: "SMTP Test Email",
      text: "This is a test email from your Node.js app!",
    });

    console.log("Email sent successfully:", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

sendTestEmail();
