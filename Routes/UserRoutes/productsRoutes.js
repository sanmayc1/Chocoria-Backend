import express from "express";
import {getProductDetailsUser, getProductsUserSideListing, searchProducts } from "../../Controller/productController.js";
const productRoute = express.Router()

productRoute.get("/",getProductsUserSideListing)

productRoute.get("/search",searchProducts)

productRoute.get("/:id",getProductDetailsUser)



export default productRoute