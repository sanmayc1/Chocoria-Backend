import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  buyCount: {
    type: Number,
    default: 0,
  },
});


const Brand =  mongoose.model("Brand",brandSchema)

export default Brand
