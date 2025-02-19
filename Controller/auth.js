import { hash, compare } from "bcrypt";
import User from "../Model/userModel.js";
import axios from "axios";
import sendOtpEmail from "../utils/sendOtp.js";
import Otp from "../Model/otpModel.js";
import tokenGenerate from "../utils/jwtTokenGenerate.js";
const saltRound = 10;

// register a new user
const authSignUp = async (req, res) => {
  try {
    //Checking the the user is already exist
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      //conflict response
      return res.status(409).json({
        success: false,
        message: "User alerady existing",
      });
    }
    // Save user data in database
    const hashPassword = await hash(req.body.password, saltRound);
    const newUser = new User({ ...req.body, password: hashPassword });
    const saved = await newUser.save();
    // success response
    if (saved) {
      // genegrate otp and send to the user email
      await sendOtpEmail(saved.email, saved.id, saved.username);
      res.status(200).json({
        success: true,
        message: "user registred please verify the email otp send successfully",
        id: saved.id,
      });
    }
  } catch (error) {
    // error response
    res
      .status(500)
      .json({ status: 500, success: false, message: error.message });
    console.log(error.message);
  }
};

/// Login or signUp with google

const authWithGoogle = async (req, res) => {
  const { accessToken } = req.body;

  try {
    // fetching user informations from google
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
    );

    if (!response?.data) {
      return res
        .status(401)
        .json({ success: false, message: "user authentication failed" });
    }

    const { email, name } = response.data;
    // verifying that user is already exist
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      // if before signUp with email prevent the login
      if (!existingUser.is_GoogleAuth) {
        return res.status(400).json({
          success: false,
          message:
            "This email already registered with a password so please login with password",
        });
      }
      // if before signUp with google allow login
      if (existingUser.is_Blocked) {
        return res.status(403).json({
          success: false,
          message: "Account blocked please contact support",
        });
      }

      const userDetails = { id: existingUser.id, role: existingUser.role };
      const token = tokenGenerate(userDetails);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return res.status(200).json({
        success: true,
        message: "User authenticated successfully",
        auth: true,
        role: existingUser.role,
      });
    }

    // if the user does not exists register the user and allow login

    const newUser = new User({
      email: email,
      username: name,
      is_GoogleAuth: true,
      is_Verified: true,
    });
    const saved = await newUser.save();
    if (saved) {
      const userDetails = { id: saved.id, role: saved.role, auth: true };
      const token = tokenGenerate(userDetails);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(200).json({
        success: true,
        message: "User authenticated successfully",
        auth: true,
        role: saved.role,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// verify the email using otp

const verifyOtp = async (req, res) => {
  const { id, otp } = req.body;
  try {
    const findOtp = await Otp.findOne({ userId: id });

    if (!findOtp) {
      return res.status(401).json({
        success: false,
        message: "Your OTP has expired. Please request a new OTP to proceed",
      });
    }

    if (findOtp.otp !== otp) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect OTP. Please try again" });
    }

    await User.findByIdAndUpdate(id, { is_Verified: true });
    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    console.log(error);
  }
};

//resend the otp

const resend_Otp = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    await sendOtpEmail(user.email, id, user.username);
    return res
      .status(200)
      .json({ success: true, message: "OTP resend successfully!" });
  } catch (error) {
    console.log(error);
  }
};

// login request

const authLogin = async (req, res) => {
  try {
    //check user exist
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please try again.",
      });
    }
    // google auth user not allowed

    if (user.is_GoogleAuth) {
      return res.status(401).json({
        success: false,
        message: "Registered with Google. Please log in using Google.",
      });
    }
    //  blocked user
    if (user.is_Blocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked please contact support",
      });
    }
    // not verified user
    if (!user.is_Verified) {
      await sendOtpEmail(user.email, user.id, user.username);
      return res.status(403).json({
        success: false,
        message: "Account not verified.Redirect to verification page",
        id: user.id,
      });
    }

    //matching user password
    const match = await compare(req.body.password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please try again.",
      });
    }

    const date = new Date().toLocaleString().split(",")[0];
    await User.findByIdAndUpdate(user.id, { last_login: date });
    const userDetails = {
      id: user.id,
      role: user.role,
    };

    const token = tokenGenerate(userDetails);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      auth: true,
      role: user.role,
    });
  } catch (error) {
    console.log(error);
  }
};

export { authSignUp, authWithGoogle, verifyOtp, resend_Otp, authLogin };
