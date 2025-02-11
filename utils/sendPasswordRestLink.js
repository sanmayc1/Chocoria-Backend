import nodemailer from "nodemailer";
import { Email, Password, FRONTEND_URL } from "./envValues.js";

const sendPasswordRestLink = async (userId, recipientEmail, username) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Email,
        pass: Password,
      },
    });

    const resetUrl = `${FRONTEND_URL}/reset-password/${userId}`;

    const mailOptions = {
      from: Email, // Sender address
      to: recipientEmail, // Recipient address
      subject: "Verify OTP", // Subject line
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .header img {
      max-width: 150px;
    }
    .content {
      padding: 20px;
      text-align: center;
      font-size: 16px;
      color: #333;
    }
    .btn {
      display: inline-block;
      padding: 12px 20px;
      background-color: #000000;
      font-size: 16px;
      border-radius: 5px;
      margin-top: 20px;
      
    }
     a {
    color: #ffffff !important;
        text-decoration: none;
     }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #888;
    }
    @media (max-width: 600px) {
      .container {
        width: 100%;
        padding: 10px;
      }
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- Header -->
    <div class="header">
      <h2>Chocoria</h2>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hello,${username}</p>
      <p>We received a request to reset your password. Click the button below to set a new password.</p>
      <a href=${resetUrl} class="btn">Reset Password</a>
      <p>If you didn t request a password reset, you can ignore this email.</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Need help? <a href="mailto:sanmayc9@gmail.com">Contact Support</a></p>
      <p>&copy; 2025 Chocoria. All rights reserved.</p>
    </div>
  </div>

</body>
</html>
`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent");
  } catch (error) {
    console.log(error);
  }
};

export default sendPasswordRestLink;
