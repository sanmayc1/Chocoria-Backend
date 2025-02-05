import express from "express";
import { addtocart, delete_from_cart, get_all_products_from_cart, quantity_update } from "../../Controller/cartController.js";
const cart_Route = express.Router()


cart_Route.post("/",addtocart)
cart_Route.get("/",get_all_products_from_cart)
cart_Route.patch("/",quantity_update)
cart_Route.delete("/",delete_from_cart)

export default cart_Route