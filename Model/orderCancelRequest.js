
import mongoose from "mongoose";

const orderCancelRequestSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order", 
    required: true,
  },
  orderItem:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrderItem",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    
  },
  reason: {
    type: String, 
  },
  explanation: {
    type: String,
  },
  response: {
    type: String,
    default: "Cancellation request is under review",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const OrderCancelRequest = mongoose.model("OrderCancelRequest", orderCancelRequestSchema);

export default OrderCancelRequest;
