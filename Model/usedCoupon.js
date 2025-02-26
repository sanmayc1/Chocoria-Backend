import mongoose from "mongoose";

const usedCouponSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    couponCode:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Coupon",
        required:true
    },
    usageCount:{
        type:Number,
        default:0
    }
},
{
    timestamps:true
})

const UsedCoupon = mongoose.model("UsedCoupon",usedCouponSchema)

export default UsedCoupon