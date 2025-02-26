import mongoose from "mongoose";


const couponSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ["fixed", "percentage"], required: true },
    value: { type: Number, required: true },
    minPurchaseAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    description: { type: String },
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon