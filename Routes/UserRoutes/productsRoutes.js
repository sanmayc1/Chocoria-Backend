import express from "express";
import {getPopularProductsUserSideListing, getProductDetailsUser, getProductsUserSideListing, recommendProducts, searchProducts, trendingProducts } from "../../Controller/productController.js";
const productRoute = express.Router()

productRoute.get("/",getProductsUserSideListing)

productRoute.get("/search",searchProducts)

productRoute.get("/popular",getPopularProductsUserSideListing)

productRoute.get("/trending",trendingProducts)

productRoute.get("/recommended/:id",recommendProducts)

productRoute.get("/:id",getProductDetailsUser)





export default productRoute