import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  offerId: {
    type: String,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  offers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Offer",
    default: [],
  },
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
