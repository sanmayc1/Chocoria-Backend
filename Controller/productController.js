import Product from "../Model/productModel.js";
import fs from "fs";
import Variant from "../Model/variant.js";
import mongoose from "mongoose";
import path from "path";
import offerCalculate from "../utils/offerCalculate.js";
import OrderItem from "../Model/orderItemsModel.js";
import { populate } from "dotenv";
import { log } from "console";
// add new product

const addProduct = async (req, res) => {
  try {
    const { name, brand, category, description, ingredients } = req.body;
    const variants = JSON.parse(req.body.variants);

    const images = req.files.map((file) => `/img/products/${file.filename}`);

    const newProduct = new Product({
      name,
      brand,
      category,
      description,
      ingredients,
      variants: [],
      images,
    });

    // Save the product in the database
    const savedProduct = await newProduct.save();

    const newVariants = await Promise.all(
      variants.map(async (variant) => {
        const saveVariant = new Variant({
          productId: savedProduct._id,
          weight: variant.weight,
          price: variant.price,
          quantity: variant.quantity,
        });
        const savedVariant = await saveVariant.save();

        return savedVariant._id;
      })
    );

    savedProduct.variants = newVariants;
    await savedProduct.save();

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

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("variants");

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

const softDeleteProduct = async (req, res) => {
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

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existInOrder = await OrderItem.findOne({ productId: id });
    if (existInOrder) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Product is already in an order can't delete you can disable it",
        });
    }

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
    // delete variants
    await Promise.all(
      product.variants.map(async (variant) => {
        const variantDeleted = await Variant.findByIdAndDelete(variant._id);
        return variantDeleted;
      })
    );
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

const getProductDetailsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    let product = await Product.findById(id).populate("variants");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "successfully fetched products",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getProductDetailsUser = async (req, res) => {
  try {
    const { id } = req.params;

    let product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    product.popularity += 1;
    await product.save();
    product = await Product.findById(id)
      .populate("variants")
      .populate("offer")
      .populate({
        path: "category",
        populate: {
          path: "offer",
        },
      })
      .populate("brand")
      .lean();
    const productsWithOfferApplied = offerCalculate([product]);
    return res.status(200).json({
      success: true,
      message: "successfully fetched products",
      product: productsWithOfferApplied[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// recommend products

const recommendProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const sameCategory = await Product.find({
      category: product.category._id,
    })
      .populate("variants")
      .populate("offer")
      .populate({
        path: "category",
        populate: {
          path: "offer",
        },
      })
      .limit(3)
      .lean();
    const priceRange = await Product.find({
      price: { $gte: product.price - 100, $lte: product.price + 100 },
    })
      .populate("variants")
      .populate("offer")
      .populate({
        path: "category",
        populate: {
          path: "offer",
        },
      })
      .limit(3)
      .lean();
    const recomendation = [...sameCategory, ...priceRange];

    const productsWithOfferApplied = offerCalculate(recomendation);
    

    return res.status(200).json({
      success: true,
      message: "successfully fetched products",
      recommendation: productsWithOfferApplied,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// edit product
const editProduct = async (req, res) => {
  try {
    const { name, brand, category, description, ingredients } = req.body;
    const images = req.files.map((file) => `/img/products/${file.filename}`);
    const { id } = req.params;
    const variants = JSON.parse(req.body.variants);
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // delete old images
    product.images.forEach((image) => {
      fs.unlinkSync(`./img/products/${image.split("/").pop()}`);
    });

    //delete old varients

    const newVariants = await Promise.all(
      variants.map(async (variant) => {
        if (mongoose.Types.ObjectId.isValid(variant._id)) {
          const exist = await Variant.findById(variant._id);

          if (exist) {
            exist.weight = variant.weight;
            exist.price = variant.price;
            exist.quantity = variant.quantity;
            const savedVariant = await exist.save();
            return savedVariant._id;
          }
        }

        const saveVariant = new Variant({
          productId: id,
          weight: variant.weight,
          price: variant.price,
          quantity: variant.quantity,
        });

        const savedVariant = await saveVariant.save();

        return savedVariant._id;
      })
    );
    const deletedVariants = await Variant.find({
      _id: { $nin: newVariants },
      productId: id,
    });

    await Promise.all(
      deletedVariants.map(async (variant) => {
        await Variant.findByIdAndDelete(variant);
      })
    );

    product.name = name;
    product.brand = brand;
    product.category = category;
    product.description = description;
    product.ingredients = ingredients;
    product.variants = newVariants;
    product.images = images;
    await product.save();
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// search products

const searchProducts = async (req, res) => {
  try {
    const { searchQuery, sortBy, rating, category,brand } = req.query;
    const query = decodeURIComponent(searchQuery);
    const filter = {};
    filter.is_deleted = false;

    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    if (category) {
      
      
      filter.category = new mongoose.Types.ObjectId(`${category}`);
    }

    if(rating){
      filter.averageRating = {
        $gte: Number(rating),
      }
    }

    if(brand){
      filter.brand = new mongoose.Types.ObjectId(`${brand}`);
    }

    const sortOptions = {};

    if (sortBy) {
      if (sortBy === "aA-zZ") {
        sortOptions.name = 1;
      } else if (sortBy === "zZ-aA") {
        sortOptions.name = -1;
      } else if (sortBy === "newArrival") {
        sortOptions.createdAt = -1;
      } else if (sortBy === "highToLow") {
        sortOptions.firstVariantPrice = -1;
      } else if (sortBy === "lowToHigh") {
        sortOptions.firstVariantPrice = 1;
      } else if (sortBy === "popularity") {
        sortOptions.popularity = -1;
      }
    } else {
      sortOptions.createdAt = -1;
    }

    const products = await Product.aggregate([
      {
        $lookup: {
          from: "variants",
          localField: "variants",
          foreignField: "_id",
          as: "variants",
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer",
          foreignField: "_id",
          as: "offer",
        },
      },
      {
        $unwind: {
          path: "$offer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          firstVariantPrice: { $arrayElemAt: ["$variants.price", 0] },
        },
      },
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "category.offer",
          foreignField: "_id",
          as: "category.offer",
        },
      },
      {
        $unwind: {
          path: "$category.offer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: sortOptions,
      },
    ]);
    const productsWithOfferApplied = offerCalculate(products);
    return res.status(200).json({
      success: true,
      message: "successfully fetched products",
      products: productsWithOfferApplied,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getProductsUserSideListing = async (req, res) => {
  try {
    let products = await Product.find({ is_deleted: false })
      .populate({
        path: "category",
        populate: {
          path: "offer",
        },
      })
      .populate("variants")
      .populate("offer")
      .limit(10)
      .lean();

    const productsWithOfferApplied = offerCalculate(products);

    res.status(200).json({
      success: true,
      message: "successfully fetched products",
      products: productsWithOfferApplied,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const topSellingProducts = async (req, res) => {
  try {
    let products = await Product.find({ is_deleted: false, buyCount: { $ne: 0 } })
      .sort({ buyCount: -1 })
      .limit(10);

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

const getPopularProductsUserSideListing = async (req, res) => {
  try {
    let products = await Product.find({ is_deleted: false })
      .populate({
        path: "category",
        populate: {
          path: "offer",
        },
      })
      .populate("variants")
      .populate("offer")
      .sort({ popularity: -1 })
      .limit(10)
      .lean();

    const productsWithOfferApplied = offerCalculate(products);

    res.status(200).json({
      success: true,
      message: "successfully fetched products",
      products: productsWithOfferApplied,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const trendingProducts = async (req, res) => {
  try {
    let products = await Product.find({ is_deleted: false })
      .populate({
        path: "category",
        populate: {
          path: "offer",
        },
      })
      .populate("variants")
      .populate("offer")
      .sort({ buyCount: -1 })
      .limit(10)
      .lean();

    const productsWithOfferApplied = offerCalculate(products);

    res.status(200).json({
      success: true,
      message: "successfully fetched products",
      products: productsWithOfferApplied,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  addProduct,
  getProducts,
  softDeleteProduct,
  deleteProduct,
  getProductDetailsUser,
  getProductDetailsAdmin,
  editProduct,
  searchProducts,
  getProductsUserSideListing,
  topSellingProducts,
  getPopularProductsUserSideListing,
  trendingProducts,
  recommendProducts,
};
