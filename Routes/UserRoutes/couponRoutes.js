import express from "express";
import { getUserCoupons } from "../../Controller/couponController.js";
const userCouponRoute = express.Router()



userCouponRoute.get("/",getUserCoupons)


export default userCouponRoute