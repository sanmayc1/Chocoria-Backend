import express from "express";
import { addtocart, get_all_products_from_cart } from "../../Controller/cartController.js";
const cart_Route = express.Router()


cart_Route.post("/",addtocart)

cart_Route.get("/",get_all_products_from_cart)

export default cart_Route