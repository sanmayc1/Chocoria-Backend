import express from "express"
import { create_Order, createOrderCancelRequest, get_all_orders_by_user_id,getCancleRequestByItemId,getOrderItemDetails  } from "../../Controller/orderController.js"
const order_Route = express.Router()

order_Route.post("/",create_Order)

order_Route.get("/",get_all_orders_by_user_id)

order_Route.get("/:id/cancel",getCancleRequestByItemId)

order_Route.post("/:id/cancel",createOrderCancelRequest)

order_Route.get("/:id",getOrderItemDetails)




export default order_Route