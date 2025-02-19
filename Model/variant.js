import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
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