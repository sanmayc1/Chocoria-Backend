import { activeUsers, io } from "../index.js";
import User from "../Model/userModel.js";
import dateFormat from "../utils/dateFormat.js";
import sendPasswordRestLink from "../utils/sendPasswordRestLink.js";
import { hash } from "bcrypt";

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
    const { id } = req.user;

    let user = await User.findById(id).select(
      "email username phone date_of_birth"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user = { ...user._doc, date_of_birth: dateFormat(user.date_of_birth) };
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// fetch all users
const getAllUsers = async (req, res) => {
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

const softDeleteUser = async (req, res) => {
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

    if (user.is_Blocked) {
      if (activeUsers.hasOwnProperty(user._id)) {
        const socketId = activeUsers[user._id];
        if (socketId) {
          io.to(socketId).emit("block_user", {
            message: "User Account Blocked",
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `User ${user.is_Blocked ? "blocked" : "unblocked"} successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// delete user

const deleteUser = async (req, res) => {
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

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.user;

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

const addNewAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const data = req.body

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if(user.address.length === 0){
       data.default = true
    }

    user.address.push(data);
    await user.save();

    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//set default address 

const setDefaultAddress = async(req,res)=>{
  try {
    const {id} = req.user
    const {id:addressId}  = req.params
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.address = user.address.map((addres)=>{
      
      if(addres._id.toString() === addressId){
        addres.default = true
      }else{
        addres.default =false
      }
      return addres
    })

    await user.save()
    res.status(200).json({ success: true, message: "Changed Default address" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// get all user address

const getAllAddress = async (req, res) => {
  try {
    const { id } = req.user;

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

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.address = user.address.filter(
      (address) => address._id.toString() !== req.params.id
    );
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// update user address

const updateAddress = async (req, res) => {
  try {
    const { id } = req.user;

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

    res
      .status(200)
      .json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get address by id

const getAddressById = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const address = user.address.find(
      (address) => address._id.toString() === req.params.id
    );
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      address,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "This email is not registered" });
    }

    await sendPasswordRestLink(user._id, user.email, user.username);

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// reset password
const resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findById(userId);
    const saltRound = 10;
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const hashPassword = await hash(password, saltRound);
    user.password = hashPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  userLogout,
  userProfile,
  getAllUsers,
  softDeleteUser,
  deleteUser,
  updateUserProfile,
  addNewAddress,
  getAllAddress,
  deleteAddress,
  updateAddress,
  getAddressById,
  forgetPassword,
  resetPassword,
  setDefaultAddress
};
