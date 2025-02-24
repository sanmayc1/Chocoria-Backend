import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
    required:true
  },
  weight:{
    type:String,
    required:true
  },
  quantity:{
    type:Number,
    required:true
  },
  price:{
    type:Number,
    required:true
  },
  
})

const Variant = mongoose.model("Variant",variantSchema)

export default Variant