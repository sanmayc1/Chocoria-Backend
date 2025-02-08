import express from "express";
import { get_all_orders, get_order_items_by_order_id } from "../../Controller/orderController.js";
const admin_Order_Route = express.Router()

//Get all orders

admin_Order_Route.get("/",get_all_orders)
admin_Order_Route.get("/:id",get_order_items_by_order_id)

export default admin_Order_Route