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
    const { role, id } = req.user;

    const user = await User.findById(id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// fetch all users
const fetch_all_users = async (req, res) => {
  try {
    let users = await User.find().select("-password");
    users = users.filter((user) => user.role !== "admin");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// block user

const block_user = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.is_Blocked = user.is_Blocked ? false : true;
    await user.save();
    res
      .status(200)
      .json({
        success: true,
        message: `User ${
          user.is_Blocked ? "blocked" : "unblocked"
        } successfully`,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// delete user

const delete_user = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: `User deleted successfully` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { userLogout, userProfile, fetch_all_users, block_user, delete_user };
