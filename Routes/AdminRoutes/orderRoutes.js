import express from "express";
import { cancelRequestUpdate, changeOrderStatus, get_all_orders,getAllCancelRequests,getAllItemsByOrderId} from "../../Controller/orderController.js";
const admin_Order_Route = express.Router()

//Get all orders

admin_Order_Route.get("/",get_all_orders)
admin_Order_Route.patch("/:id",changeOrderStatus)
admin_Order_Route.get("/cancel",getAllCancelRequests)
admin_Order_Route.get("/:id",getAllItemsByOrderId)
admin_Order_Route.patch("/:id/cancel",cancelRequestUpdate)


export default admin_Order_Route