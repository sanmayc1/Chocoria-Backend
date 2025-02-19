import express from "express";
import {getProductDetails, getProducts, searchProducts } from "../../Controller/productController.js";
const productRoute = express.Router()

productRoute.get("/",getProducts)

productRoute.get("/search",searchProducts)

productRoute.get("/:id",getProductDetails)



export default productRoute