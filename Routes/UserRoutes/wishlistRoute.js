import express from "express";
import { addOrRemoveFromWishlist, checkProductInWishlist, deleteFromWishlist, getWishlist } from "../../Controller/whishlistController.js";

const wishlistRoute = express.Router()

wishlistRoute.post("/",addOrRemoveFromWishlist)
wishlistRoute.get("/",getWishlist)
wishlistRoute.patch("/:wishlistItemId",deleteFromWishlist)
wishlistRoute.get("/:productId/:variantId",checkProductInWishlist)

export default wishlistRoute