import { activeUsers, io } from "../index.js";
import User from "../Model/userModel.js";
import dateFormat from "../utils/dateFormat.js";

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
    const {  id } = req.user;

    let user = await User.findById(id).select("email username phone date_of_birth");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
   

    user = {...user._doc, date_of_birth:dateFormat(user.date_of_birth)}
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
    
    if(user.is_Blocked){
      if(activeUsers.hasOwnProperty(user._id)){
        const socketId = activeUsers[user._id]
         if(socketId){
           io.to(socketId).emit("block_user",{message:"User Account Blocked"});
         }
         
       }
    }
    
    
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


// update user profile

const update_profile = async (req, res) => {
  try {
    const {  id } = req.user;
    
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.phone = req.body.phone;
    user.username = req.body.username;
    user.date_of_birth = req.body.date_of_birth;

    await user.save();
    
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// add new user address 
 
const add_new_address = async (req, res) => {
  try {
    const {  id } = req.user;
    
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.address.push(req.body);
    await user.save();
    
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get all user address

const get_all_address = async (req, res) => {
  try {
    const {  id } = req.user;
   
    
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, addresses: user.address });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// delte user address

const delete_address = async (req, res) => {
  try {
    const {  id } = req.user;
    
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.address = user.address.filter((address) => address._id.toString() !== req.params.id);
    await user.save();
    
    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// update user address

const update_address = async (req, res) => {
  try {
    const {  id } = req.user;
    
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.address = user.address.map((address) =>
      address._id.toString() === req.params.id ? req.body : address
    );
    await user.save();
    
    res.status(200).json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get address by id

const get_address_by_id = async (req, res) => {
  try {
    const {  id } = req.user;
    
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const address = user.address.find((address) => address._id.toString() === req.params.id);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, message: "Address fetched successfully", address });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { userLogout, userProfile, fetch_all_users, block_user, delete_user , update_profile, add_new_address , get_all_address, delete_address, update_address, get_address_by_id};
