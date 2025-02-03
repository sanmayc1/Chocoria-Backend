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
      if(products.quantity===1){
        return res
        .status(200)
        .json({ success: true, message: "Go to Cart" });
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

export { addtocart, get_all_products_from_cart };

// try {
//   const products = req.body;
//   console.log(products);
//   const { id } = req.user;
//   // checking the user have a cart if no it will create new one
//   const existingCart = await Cart.findOne({ userId: id });
//   // if not exist create a new cart for the user save the change
//   if (!existingCart) {
//     const newCart = new Cart({
//       userId: id,
//       products,
//     });
//     await newCart.save();
//     return res
//       .status(200)
//       .json({ success: true, message: "Product added to cart" });
//   } else {
//     // checking the product is exist or not
//     const producstExist = existingCart.products.find(
//       (product) => product.productId.toString() === products.productId
//     );

//     if (producstExist) {
//       // varient change
//       if (producstExist.variant.id === products.variant.id) {
//         if (producstExist.quantity === 4) {
//           return res
//             .status(401)
//             .json({ success: false, message: "Maximum quantity reached" });
//         }

//         // add quantity with existing products
//         existingCart.products = existingCart.products.map((product) => {
//           if (product.productId.toString() === products.productId) {
//             if (product.variant.id === products.variant.id) {
//               return {
//                 productId: product.productId,
//                 quantity: product.quantity + products.quantity,
//                 variant: products.variant,
//               };
//             }
//           }
//           return product;
//         });
//         await existingCart.save();
//         return res
//           .status(200)
//           .json({ success: true, message: "Product added to cart" });
//       }

//       existingCart.products.push(products);
//       await existingCart.save();
//       return res
//         .status(200)
//         .json({ success: true, message: "Product added to cart" });
//     } else {
//       existingCart.products.push(products);
//       await existingCart.save();
//       return res
//         .status(200)
//         .json({ success: true, message: "Product added to cart" });
//     }
//   }
// } catch (error) {
//   console.log(error);
//   return res
//     .status(500)
//     .json({ success: false, message: "Internal server error" });
// }
