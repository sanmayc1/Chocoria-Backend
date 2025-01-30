import Product from "../Model/productModel.js";
import fs from "fs";
// add new product

const add_product = async (req, res) => {
  try {
    const { name, brand, category, description, ingredients, } =
      req.body;
    const variants = JSON.parse(req.body.variants)
    
   
    const images = req.files.map((file) => `/img/${file.filename}`);

    const newProduct = new Product({
      name,
      brand,
      category,
      description,
      ingredients,
      variants,
      images,
    });

    // Save the product in the database
    const savedProduct = await newProduct.save();

    // Send a success response with the saved product
    return res.status(200).json({
      message: "Product created successfully.",
      product: savedProduct,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

// fetch all products

const get_Products = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      message: "successfully fetched products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// soft delete

const product_Soft_Delete = async (req, res) => {
  try {
    const { id } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    product.is_deleted = product.is_deleted ? false : true;
    await product.save();
    res.status(200).json({
      success: true,
      message: `Product ${
        product.is_deleted ? "disabled" : "enabled"
      } successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// product delete

const delete_Product = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    // delete images
    product.images.forEach((image) => {
      fs.unlinkSync(`./img/products/${image.split("/").pop()}`);
    });
    // delete product
    await Product.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: `Product deleted successfully` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const get_Product_Details = async (req, res) => {
  try {
    const {id} = req.params;
    const product = await Product.findById(id);
    const recomendation = await Product.find({category:product.category})
    return res.status(200).json({
      success: true,
      message: "successfully fetched products",
      product,
      recomendation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// recommend products

const recommend_Products = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if(!product){
      return res.status(404).json({success:false,message:"Product not found"})
    }

    const sameCategory = await Product.find({category:product.category}).limit(3)
    const priceRange = await Product.find({price:{$gte:product.price-100,$lte:product.price+100}}).limit(3)
    const recomendation = [...sameCategory,...priceRange]
  
  
    return res.status(200).json({
      success: true,
      message: "successfully fetched products",
      recomendation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// edit product
const edit_product = async (req, res) => {
  try {
    const {  name, brand, category, description, ingredients } = req.body;
    const images = req.files.map((file) => `/img/${file.filename}`);
    const {id} = req.params;
    const variants = JSON.parse(req.body.variants)
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // delete old images
    product.images.forEach((image) => {
      fs.unlinkSync(`./img/products/${image.split("/").pop()}`);
    });

    //delete old varients
 
    product.name = name;
    product.brand = brand;
    product.category = category;
    product.description = description;
    product.ingredients = ingredients;
    product.variants = variants;
    product.images = images;
    await product.save();
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export { add_product, get_Products, product_Soft_Delete, delete_Product ,get_Product_Details,edit_product};
