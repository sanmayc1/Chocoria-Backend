import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
    offerTitle:{
        type:String,
        required:true
    },
    applicableOn:{
        type:String,
        required:true
    },
    percentage:{
        type:Number,
        required:true
    },
    maximumDiscount:{
        type:Number,
        required:true
    },
    specificProduct:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        
    },
    specificCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    expiresAt:{
        type:Date,
        required:true
    }
})

const Offer = mongoose.model("Offer",offerSchema)

export default Offer 