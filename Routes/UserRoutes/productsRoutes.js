import express from "express";
import { get_Product_Details, get_Products } from "../../Controller/productController.js";
const product_Route = express.Router()

product_Route.get("/",get_Products)

product_Route.get("/:id",get_Product_Details)

export default product_Route