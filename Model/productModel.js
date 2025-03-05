import mongoose from "mongoose";
import { type } from "os";
import { ref } from "yup";



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
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
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
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Variant",
        required:true
    },
    offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Offer",
        default:null
    },
    popularity:{
        type:Number,
        default:0
    },
    buyCount:{
        type:Number,
        default:0
    },
    averageRating:{
        type:Number,
        default:0
    },
    is_deleted:{
        type:Boolean,
        default:false
    }
   
},{timestamps:true})

const Product = mongoose.model("Product", productSchema);

export default Product;