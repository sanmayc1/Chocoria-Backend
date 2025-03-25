import Category from "../Model/categoryModel.js";
import Product from "../Model/productModel.js";

// ADD TO category

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    // check if category exists
    const category = await Category.findOne({ name: name.toLowerCase() });
    if (category) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }
    const newCategory = new Category({ name: name.toLowerCase() });

    await newCategory.save();

    res
      .status(200)
      .json({ success: true, message: "Category successfully added" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server error" });
    console.log(error);
  }
};

// fetch all category

const getCategories = async (req, res) => {
  try {
    const docs = await Category.find();

    const categories = docs.map((doc) => ({
      ...doc._doc,
      name: doc.name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));

    res.status(200).json({
      success: true,
      message: "successfully fetched categories",
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// edit category
const editCategory = async (req, res) => {
  try {
    const { id, name } = req.body;
    const category = await Category.findById(id);
    category.name = name;
    await category.save();
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    const categoryProducts = await Product.countDocuments({
      category: category._id,
    });

    if (categoryProducts > 0) {
      return res.status(400).json({
        success: false,
        message: "Category cannot be deleted as it has products",
      });
    }
    await Category.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: `Category deleted successfully` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// soft delete

const softDeleteCategory = async (req, res) => {
  try {
    const { id } = req.body;
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    category.is_deleted = category.is_deleted ? false : true;
    await category.save();
    res.status(200).json({
      success: true,
      message: `Category ${
        category.is_deleted ? "disabled" : "enabled"
      } successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const topSellingCategories = async (req, res) => {
  try {
    let categories = await Category.find({ is_deleted: false }).sort({
      buyCount: -1,
    });
    categories = categories.filter((category) => category.buyCount > 0);
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllAvailableCategories = async (req, res) => {
  try {

    let categories = await Category.find({is_deleted:false})

     categories = categories.map((doc) => ({
      ...doc._doc,
      name: doc.name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));

    return  res.status(200).json({success:true,message:"",categories})

  } catch (error) {
    res.status(500).json({success:false,message:"Internal server Error"})
  }
};

export {
  addCategory,
  getCategories,
  editCategory,
  deleteCategory,
  softDeleteCategory,
  topSellingCategories,
  getAllAvailableCategories
};
