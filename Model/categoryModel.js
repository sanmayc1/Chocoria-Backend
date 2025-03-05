import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
 
  is_deleted: {
    type: Boolean,
    default: false,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    default: null,
  },
  buyCount: {
    type: Number,
    default: 0,
  },
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
