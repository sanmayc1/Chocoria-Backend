import express from "express"
import {createOrder, createOrderCancelRequest,getAllOrderOfUser,getCancleRequestByItemId,getOrderItemDetails  } from "../../Controller/orderController.js"
const orderRoute = express.Router()

orderRoute.post("/",createOrder)

orderRoute.get("/",getAllOrderOfUser)

orderRoute.get("/:id/cancel",getCancleRequestByItemId)

orderRoute.post("/:id/cancel",createOrderCancelRequest)

orderRoute.get("/:id",getOrderItemDetails)




export default orderRoute