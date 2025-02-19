import express from "express";
import { cancelRequestUpdate, changeOrderStatus,getAllOrders,getAllCancelRequests,getAllItemsByOrderId} from "../../Controller/orderController.js";
const adminOrderRoute = express.Router()

//Get all orders

adminOrderRoute.get("/",getAllOrders)
adminOrderRoute.patch("/:id",changeOrderStatus)
adminOrderRoute.get("/cancel",getAllCancelRequests)
adminOrderRoute.get("/:id",getAllItemsByOrderId)
adminOrderRoute.patch("/:id/cancel",cancelRequestUpdate)


export default adminOrderRoute