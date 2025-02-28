import Category from "../Model/categoryModel.js";
import Offer from "../Model/offerModel.js";
import Product from "../Model/productModel.js";

const addOffer = async (req, res) => {
  try {
    const {
      offerTitle,
      applicableOn,
      percentage,
      maximumDiscount,
      expiryDate,
      specific,
    } = req.body;
 
    const exists = await Offer.findOne({
      offerTitle: offerTitle.trim().toLowerCase(),
    });

    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Offer already exists" });
    }

    if (applicableOn === "product") {
      const product = await Product.findById(specific);
      if (!product) {
        return res
          .status(409)
          .json({ success: false, message: "Product not found" });
      }
      if (product.offer) {
        return res
          .status(409)
          .json({ success: false, message: "Product already has an offer" });
      }

      const offer = new Offer({
        offerTitle: offerTitle.trim().toLowerCase(),
        applicableOn,
        percentage,
        maximumDiscount,
        specificProduct: product._id,
        expiresAt: new Date(expiryDate),
      });
      const savedOffer = await offer.save();

      product.offer = savedOffer._id;
      await product.save();

      return res
        .status(200)
        .json({ success: true, message: "Offer added successfully" });
    } else if (applicableOn === "category") {
      const category = await Category.findById(specific);
      if (!category) {
        return res
          .status(409)
          .json({ success: false, message: "Category not found" });
      }

      const offer = new Offer({
        offerTitle: offerTitle.trim().toLowerCase(),
        applicableOn,
        percentage,
        maximumDiscount,
        specificCategory: category._id,
        expiresAt: new Date(expiryDate),
      });

      const savedOffer = await offer.save();
      category.offer = savedOffer._id;
      await category.save();

      return res
        .status(200)
        .json({ success: true, message: "Offer added successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getAllOffers = async (req, res) => {
  try {
    const productsOffers = await Offer.find({
      applicableOn: "product",
    }).populate("specificProduct");
    const categoryOffers = await Offer.find({
      applicableOn: "category",
    }).populate("specificCategory");
    res.status(200).json({ success: true, productsOffers, categoryOffers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

export { addOffer, getAllOffers };
