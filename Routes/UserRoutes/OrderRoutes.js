import express from "express"
import {createOrder, createOrderCancelRequest,createRazorpayOrder,getAllOrderOfUser,getCancleRequestByItemId,getOrderItemDetails, getUserOrderDetails, orderStatusUpdate, verifyRazorpayPayment, verifyRetryPayment  } from "../../Controller/orderController.js"
const orderRoute = express.Router()

orderRoute.post("/",createOrder)

orderRoute.get("/",getAllOrderOfUser)

orderRoute.get("/:id/cancel",getCancleRequestByItemId)
orderRoute.patch("/status",orderStatusUpdate)
orderRoute.post("/:id/cancel",createOrderCancelRequest)
orderRoute.post("/razorpay",createRazorpayOrder)
orderRoute.patch("/payment/verify/retry",verifyRetryPayment)
orderRoute.patch("/payment/verify",verifyRazorpayPayment)
orderRoute.get("/details/:id",getUserOrderDetails)
orderRoute.get("/:id",getOrderItemDetails)




export default orderRoute