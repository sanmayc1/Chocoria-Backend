import mongoose from "mongoose";


const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uniqueOrderId:{type:String,required:true},
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }], // Referencing Order Items
    totalAmount: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    coupon: { type: Object, default: null }, // Applied coupon code
    totalAmountAfterDiscount: { type: Number, required: true }, 
    orderDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ["COD","Online"], required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      detailed_address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String },
      address_type: { type: String, enum: ["Home", "Office"], required: true }
    },
  });


const Order = mongoose.model("Order", OrderSchema);

export default Order