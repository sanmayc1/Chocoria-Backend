import Wishlist from "../Model/wishlistModel.js";

const addOrRemoveFromWishlist = async (req, res) => {
  try {
    const { productId, variant } = req.body;
    const { id: userId } = req.user;
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      const newWishlist = new Wishlist({
        userId,
        products: [{ productId, variant }],
      });

      await newWishlist.save();
      return res
        .status(200)
        .json({ success: true, message: "Product added to wishlist" });
    }

    const product = wishlist.products.find(
      (product) =>
        product.productId.toString() === productId &&
        product.variant.toString() === variant
    );

    if (product) {
      wishlist.products = wishlist.products.filter(
        (product) =>
          product.productId.toString() !== productId &&
          product.variant.toString() !== variant
      );
      await wishlist.save();
      return res
        .status(200)
        .json({ success: true, message: "Product removed from wishlist" });
    }

    const newProduct = { productId, variant };
    wishlist.products.push(newProduct);
    await wishlist.save();
    return res
      .status(200)
      .json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { id } = req.user;
    let wishlist = await Wishlist.findOne({ userId: id })
      .populate("products.productId")
      .populate("products.variant");
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }
    wishlist.products = wishlist.products.filter(
      (item) =>
        item.productId?.is_deleted === false &&
        item.variant !== null &&
        item.productId !== null
    );
    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const deleteFromWishlist = async (req, res) => {
  try {
    const { id } = req.user;
    const { wishlistItemId } = req.params;
    const wishlist = await Wishlist.findOne({ userId: id });
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }
    wishlist.products = wishlist.products.filter(
      (product) => product._id.toString() !== wishlistItemId
    );
    await wishlist.save();
    return res
      .status(200)
      .json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {}
};

const checkProductInWishlist = async (req, res) => {
  try {
    const { id } = req.user;
    const { productId, variantId } = req.params;
    const wishlist = await Wishlist.findOne({ userId: id });
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found", exists: false });
    }
    const product = wishlist.products.find(
      (product) =>
        product.productId.toString() === productId &&
        product.variant.toString() === variantId
    );
    if (!product) {
      return res.status(200).json({
        success: true,
        message: "Product not found in wishlist",
        exists: false,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product found in wishlist",
      exists: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export {
  addOrRemoveFromWishlist,
  getWishlist,
  deleteFromWishlist,
  checkProductInWishlist,
};
