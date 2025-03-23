import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    rating:{
        type:Number,
        default:0
    },
    orderItemId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"OrderItem",
        required:true,
    },
    review:{
        type:String,
        required:true
    }
})

const Review = mongoose.model("Review",reviewSchema)

export default Review