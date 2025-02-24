import { Router } from "express";
import {
  authLogin,
  authSignUp,
  authWithGoogle,
  resend_Otp,
  verifyOtp,
} from "../../Controller/auth.js";
import userDataValidation from "../../Middleware/validation.js";
import {
  forgetPassword,
  resetPassword,
  updateUserProfile,
  userLogout,
  userProfile,
} from "../../Controller/userController.js";
import jwtVerify from "../../Middleware/jwtVerify.js";
import cartRoute from "./cartRoute.js";
import addressRoute from "./addressRoute.js";
import productRoute from "./productsRoutes.js";
import orderRoute from "./OrderRoutes.js";
import { getCategories } from "../../Controller/categoryController.js";
import wishlistRoute from "./wishlistRoute.js";
import { getWalletByUserId } from "../../Controller/walletController.js";
const userRoute = Router();

userRoute.post("/auth/signup", userDataValidation, authSignUp);
userRoute.post("/auth/google", authWithGoogle);
userRoute.patch("/otp", verifyOtp);
userRoute.post("/resend-otp", resend_Otp);
userRoute.post("/auth/login", authLogin);
userRoute.post("/logout", userLogout);

userRoute.post("/forget-password", forgetPassword);
userRoute.patch("/reset-password", resetPassword);

userRoute.get("/profile", jwtVerify, userProfile);
userRoute.patch("/update-profile", jwtVerify, updateUserProfile);

userRoute.get("/categories", getCategories);
userRoute.get("/wallet",jwtVerify, getWalletByUserId);

userRoute.use("/products", productRoute);
userRoute.use("/address", jwtVerify, addressRoute);
userRoute.use("/cart", jwtVerify, cartRoute);
userRoute.use("/order",jwtVerify, orderRoute);
userRoute.use("/wishlist",jwtVerify, wishlistRoute)
export default userRoute;
