import Cart from "../Model/cartModel.js";
import User from "../Model/userModel.js";

const addtocart = async (req, res) => {
  try {
    const products = req.body;
    const { id } = req.user;

    // check this user have a cart if no create one

    const existingCart = await Cart.findOne({ userId: id });
    if (!existingCart) {
      const newCart = new Cart({
        userId: id,
        products,
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
        product.variant.id === products.variant.id
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
          product.variant.id === products.variant.id
        ) {
          return {
            productId: product.productId,
            quantity: products.quantity,
            variant: product.variant,
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

const get_all_products_from_cart = async (req, res) => {
  try {
    const { id } = req.user;
    const cart = await Cart.findOne({ userId: id }).populate(
      "products.productId"
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// update the quantity of a product in the cart

const quantity_update = async (req, res) => {
  try {
    const { id } = req.user;
    const { productId, quantity, variantId } = req.body;

    const cart = await Cart.findOne({ userId: id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    const product = cart.products.find(
      (product) =>
        product.productId.toString() === productId &&
        product.variant.id === variantId
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    if (product.variant.quantity < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Sorry! We don't have any more units for this item." });
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

const delete_from_cart = async (req, res) => {
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
        product.variant.id === variantId
    );

    if (!productExists) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    cart.products = cart.products.filter(
      (product) => product._id.toString() !== productExists._id.toString() );
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

export { addtocart, get_all_products_from_cart, quantity_update, delete_from_cart };
