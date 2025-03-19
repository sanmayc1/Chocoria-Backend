import mongoose from "mongoose";

const orderReturnRequestSchema = new mongoose.Schema({ 
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
    default: "Return request is under review",
  },
  
},{timestamps:true});

const orderReturnRequest = mongoose.model("orderReturnRequestSchema", orderReturnRequestSchema);

export default orderReturnRequest;
