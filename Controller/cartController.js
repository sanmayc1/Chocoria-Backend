import { populate } from "dotenv";
import Cart from "../Model/cartModel.js";
import Product from "../Model/productModel.js";
import User from "../Model/userModel.js";
import Variant from "../Model/variant.js";
import offerCalculate from "../utils/offerCalculate.js";

const addtocart = async (req, res) => {
  try {
    const products = req.body;
    const { id } = req.user;
   
console.log(products,);
    if (products.quantity > 8) {
      return res.status(400).json({
        success: false,
        message: "A person can only buy a maximum of 8 items at once",
      });
    }

    // check this user have a cart if no create one

    const existingCart = await Cart.findOne({ userId: id });
    if (!existingCart) {
      const newCart = new Cart({
        userId: id,
        products: [
          {
            productId: products.productId,
            variant: products.variant._id,
            quantity: products.quantity,
          },
        ],
      });
      await newCart.save();
      return res
        .status(200)
        .json({ success: true, message: "Product added to cart" });
    }

    // if cart exists check the product Id and variant id are matching item already exist

    const existingProduct = existingCart.products.find((product) => {
      if (
        product.productId.toString() === products.productId &&
        product.variant.toString() === products.variant._id
      ) {
        return product;
      }
    });

    // if product exist update the quantity

    if (existingProduct) {
      if (products.quantity === 1) {
        return res.status(200).json({ success: true, message: "Go to Cart" });
      }

      existingCart.products = existingCart.products.map((product) => {
        if (
          product.productId.toString() === products.productId &&
          product.variant.toString() === products.variant._id
        ) {
          console.log(product);
          return {
            productId: product.productId,
            quantity: products.quantity,
            variant: product.variant._id,
          };
        }
        return product;
      });

      await existingCart.save();
      return res
        .status(200)
        .json({ success: true, message: "Quantity updated in Cart" });
    }
    // if the product not exist add new one

    const quantity = Variant.findById(products.variant._id).quantity;

    if (quantity == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product out of stock" });
    }
    existingCart.products.push(products);
    await existingCart.save();
    return res
      .status(200)
      .json({ success: true, message: "Product added to cart" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// get all products from cart

const getAllProductsFromCart = async (req, res) => {
  try {
    const { id } = req.user;
    const cart = await Cart.findOne({ userId: id })
      .populate({
        path: "products.productId",
        populate: {
          path: "category",
          populate: {
            path: "offer",
          },
        },
      })

      .populate("products.variant");

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.products = cart.products
      .filter(
        (product) =>
          product.productId && !product.productId.is_deleted && product.variant
      )
      .map((product) => ({
        productId: product.productId._id,
        variant: product.variant._id,
        quantity:
          product.quantity > product.variant.quantity
            ? product.variant.quantity
            : product.quantity === 0 && product.variant.quantity > 0
            ? 1
            : product.quantity,
      }));

    await cart.save();
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: "products.productId",
        populate: {
          path: "category",
          populate: {
            path: "offer",
          },
        },
      })
      .populate({
        path: "products.productId",
        populate: {
          path: "offer",
        },
      })
      .populate("products.variant")
      .lean();

    updatedCart.products.forEach((product) => {
      if (product.productId.offer || product.productId.category.offer) {
        product.variant = product.variant;
        const calculateOffer = offerCalculate(
          [product.productId],
          product.variant
        );
        product.productId = calculateOffer?.products[0];
        product.variant = calculateOffer?.variant;
      }
    });

    return res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// update the quantity of a product in the cart

const quantityUpdate = async (req, res) => {
  try {
    const { id } = req.user;
    const { productId, quantity, variantId } = req.body;

    if (quantity > 8) {
      return res.status(400).json({
        success: false,
        message: "A person can only buy a maximum of 8 items at once",
      });
    }

    const cart = await Cart.findOne({ userId: id }).populate(
      "products.variant"
    );
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    const product = cart.products.find(
      (product) =>
        product.productId.toString() === productId &&
        product.variant._id.toString() === variantId
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    if (product.variant.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Sorry! We don't have any more units for this item.",
      });
    }

    product.quantity = quantity;
    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Quantity updated in cart" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// delete a product from cart

const deleteFromCart = async (req, res) => {
  try {
    const { id } = req.user;
    const { productId, variantId } = req.query;

    const cart = await Cart.findOne({ userId: id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    const productExists = cart.products.find(
      (product) =>
        product.productId.toString() === productId &&
        product.variant._id.toString() === variantId
    );

    if (!productExists) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    cart.products = cart.products.filter(
      (product) => product._id.toString() !== productExists._id.toString()
    );
    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Product removed from cart" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export { addtocart, getAllProductsFromCart, quantityUpdate, deleteFromCart };
