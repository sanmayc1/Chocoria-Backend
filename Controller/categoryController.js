import Category from "../Model/categoryModel.js";

// ADD TO category

const add_to_category = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
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

const get_categories = async (req, res) => {
  try {
    const categories = await Category.find();
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

const edit_category = async (req, res) => {
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

const delete_category = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
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

const soft_Delete_category = async(req,res)=>{

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
        res
          .status(200)
          .json({
            success: true,
            message: `Category ${
                category.is_Blocked ? "disabled" : "enabled"
            } successfully`,
          });
      } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }

}

export { add_to_category, get_categories, edit_category, delete_category,soft_Delete_category };
