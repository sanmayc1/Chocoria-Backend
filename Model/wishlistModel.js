import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[
        {
            productId:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
            variant:{type:mongoose.Schema.Types.ObjectId,ref:"Variant",required:true}
        }
    ]
},
{
    timestamps:true
})

const Wishlist = mongoose.model("Wishlist",wishlistSchema)

export default Wishlist