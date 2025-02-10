import express from "express";
import { get_Product_Details, getProducts, searchProducts } from "../../Controller/productController.js";
const product_Route = express.Router()

product_Route.get("/",getProducts)

product_Route.get("/search",searchProducts)

product_Route.get("/:id",get_Product_Details)



export default product_Route