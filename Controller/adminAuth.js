import { compare } from "bcrypt";
import tokenGenerate from "../utils/jwtTokenGenerate.js";
import User from "../Model/userModel.js";

const authAdminLogin = async (req, res) => {
  try {
    //check user exist
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please try again.",
      });
    }
    // check is admin
    if (user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please try again.",
      });
    }
    //check password
    const isMatch = await compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please try again.",
      });
    }
    //generate token
    const token = tokenGenerate({ id: user._id, role: user.role });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      auth: true,
      role: user.role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { authAdminLogin };
