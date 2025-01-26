import nodemailer from "nodemailer";
import { Email, Password } from "./envValues.js";
import Otp from "../Model/otpModel.js";

const generateOtp = async (id) => {
  let otp = "";
  for (let i = 0; i < 4; i++) {
    otp += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
  }

  try {
    const otpExist = await Otp.findOne({ userId: id });
    if (otpExist) {
      await Otp.findByIdAndDelete(otpExist.id);
    }

    const newOtp = new Otp({ userId: id, otp });
    await newOtp.save();
    return otp;
  } catch (error) {
    console.log(error);
  }
};

const sendOtpEmail = async (recipientEmail, id, username) => {
  try {
    // Create a transporter object using SMTP or a service like Gmail
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: Email,
        pass: Password,
      },
    });

    // Email options
    const mailOptions = {
      from: Email, // Sender address
      to: recipientEmail, // Recipient address
      subject: "Verify OTP", // Subject line
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chocoria OTP Email</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f3e6;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 2px solid #d3ad7f;
    }
    .email-header {
      background-color: #d3ad7f;
      color: #fff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
    }
    .email-body {
      padding: 20px;
      color: #4e4e4e;
      line-height: 1.6;
    }
    .otp-box {
      margin: 20px 0;
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color:rgb(0, 0, 0);
      padding: 10px 20px;
      
    }
    .cta {
      text-align: center;
      margin: 20px 0;
    }
    .cta a {
      text-decoration: none;
      color: #fff;
      background-color: #b85c38;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
    }
    .footer {
      background-color: #f8f3e6;
      text-align: center;
      padding: 10px;
      color: #9e9e9e;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      Welcome to Chocoria! 🍫
    </div>
    <div class="email-body">
      <p>Dear ${username},</p>
      <p>Thank you for choosing Chocoria for your sweet experiences. To complete your verification, please use the One-Time Password (OTP) below:</p>
      <div class="otp-box">${await generateOtp(id)}</div>
      <p>If you did not request this, please ignore this email or contact our support team for assistance.</p>
      <div class="cta">
        <a href="#">Visit Chocoria</a>
      </div>
      <p>We look forward to serving you more delightful moments!</p>
    </div>
    <div class="footer">
      &copy; 2025 Chocoria Inc. All Rights Reserved.
    </div>
  </div>
</body>
</html>
`, // HTML body
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully.");
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    throw error;
  }
};

export default sendOtpEmail;
