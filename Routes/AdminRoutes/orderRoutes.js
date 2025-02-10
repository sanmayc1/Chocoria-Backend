import express from "express";
import { changeOrderStatus, get_all_orders,getAllItemsByOrderId} from "../../Controller/orderController.js";
const admin_Order_Route = express.Router()

//Get all orders

admin_Order_Route.get("/",get_all_orders)
admin_Order_Route.patch("/:id",changeOrderStatus)
admin_Order_Route.get("/:id",getAllItemsByOrderId)

export default admin_Order_Route