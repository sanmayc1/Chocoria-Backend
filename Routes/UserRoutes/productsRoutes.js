import express from "express";
import {getProductDetails, getProductsUserSideListing, searchProducts } from "../../Controller/productController.js";
const productRoute = express.Router()

productRoute.get("/",getProductsUserSideListing)

productRoute.get("/search",searchProducts)

productRoute.get("/:id",getProductDetails)



export default productRoute