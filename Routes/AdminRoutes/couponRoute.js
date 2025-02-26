import express from "express";
const AdmincouponRoute = express.Router()
import { addCoupon, deleteCoupon, getAllCoupons } from "../../Controller/couponController.js";


AdmincouponRoute.post("/",addCoupon);
AdmincouponRoute.get("/",getAllCoupons);
AdmincouponRoute.delete("/:id",deleteCoupon);



export default AdmincouponRoute