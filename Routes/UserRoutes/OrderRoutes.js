import express from "express"
import {createOrder, createOrderCancelRequest,getAllOrderOfUser,getCancleRequestByItemId,getOrderItemDetails, getUserOrderDetails, orderStatusUpdate, verifyRazorpayPayment  } from "../../Controller/orderController.js"
const orderRoute = express.Router()

orderRoute.post("/",createOrder)

orderRoute.get("/",getAllOrderOfUser)

orderRoute.get("/:id/cancel",getCancleRequestByItemId)
orderRoute.patch("/status",orderStatusUpdate)
orderRoute.post("/:id/cancel",createOrderCancelRequest)
orderRoute.patch("/payment/verify",verifyRazorpayPayment)
orderRoute.get("/details/:id",getUserOrderDetails)
orderRoute.get("/:id",getOrderItemDetails)




export default orderRoute