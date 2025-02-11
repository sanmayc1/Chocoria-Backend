import mongoose from "mongoose";
import { type } from "os";



const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    images:{
        type:[String],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    ingredients:{
        type:String,
        required:true
    },
    variants:{
        type:[Object],
        required:true
    },
    offer:{
        type:[String],
        required:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    }
   
},{timestamps:true})

const Product = mongoose.model("Product", productSchema);

export default Product;