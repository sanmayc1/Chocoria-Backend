import Category from "../Model/categoryModel.js";
import Offer from "../Model/offerModel.js";
import Product from "../Model/productModel.js";
import ReferralOffer from "../Model/referralOffer.js";

const addOffer = async (req, res) => {
  try {
    const { offerTitle, applicableOn, percentage, expiryDate, specific } =
      req.body;

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

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    if (offer.applicableOn === "product") {
      const product = await Product.findById(offer.specificProduct);
      product.offer = null;
      await product.save();
    } else {
      const category = await Category.findById(offer.specificCategory);
      category.offer = null;
      await category.save();
    }
    await Offer.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Offer deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getReferralOffer = async (req, res) => {
  try {
    const defaultReferral = await ReferralOffer.findOne({
      offer: "defaultReferral",
    });
    if (!defaultReferral) {
      return res
        .status(404)
        .json({ success: false, message: "Referral offer not found" });
    }
    
    res.status(200).json({ success: true, defaultReferral });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const editDefaultReferral = async (req, res) => {
  try {
    const { amount ,title } = req.body;
    const defaultReferral = await ReferralOffer.findOne({
      offer: "defaultReferral",
    });
    if (!defaultReferral) {
      const newReferral = new ReferralOffer({
        title,
        amount,
      });
      await newReferral.save();
      return res
        .status(200)
        .json({ success: true, message: "Referral offer added successfully" });
    }

    defaultReferral.amount = amount;
    defaultReferral.title = title;
    await defaultReferral.save();
    res
      .status(200)
      .json({ success: true, message: "Referral offer updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

export { addOffer, getAllOffers, deleteOffer ,getReferralOffer,editDefaultReferral};
