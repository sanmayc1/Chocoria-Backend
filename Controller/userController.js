import User from "../Model/userModel.js";

// logout user
const userLogout = async (req, res) => {
    
  res.cookie("token", "", {
    httpOnly: true,
    secure: true, // Set to true if you're using HTTPS
    expires: new Date(0), // Expire cookie immediately
    path: "/", // Ensure the path matches where the cookie was set
  });
  res.status(200).json({ success: true, message: "User logout successfully" });
};

// profile details

const userProfile = async (req, res) => {
  try {
  const  {role, id} = req.user;
    
    const user = await User.findById(id).select("-password");
    res.status(200).json({ success: true, user });
    } catch (error) {   
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const fetch_all_users = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { userLogout , userProfile,fetch_all_users };