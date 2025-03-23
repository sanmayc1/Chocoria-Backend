import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: Number, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String },
  default:{
    type:Boolean,
    default:false
  },
  detailed_address: { type: String, required: true },
  address_type: { type: String, enum: ["Home", "Office"], required: true }
});


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    date_of_birth: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
      default:""
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    is_GoogleAuth: {
      type: Boolean,
      default: false,
    },
    is_Blocked: {
      type: Boolean,
      default: false,
    },
    is_Verified: {
      type: Boolean,
      default: false,
    },
    address:{
      type:[AddressSchema],
      default:[]
    },
    last_login:{
      type:String
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
