import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  img: { type: String, required: true },
  variant: { type: Object, required: true },
  couponDiscount: { type: Number, default: 0 },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  totalAmountAfterDiscount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Order Not Placed"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed", "refunded"],
    default: "pending",
  },
});

const OrderItem = mongoose.model("OrderItem", OrderItemSchema);

export default OrderItem;
