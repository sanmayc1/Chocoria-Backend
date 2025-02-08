import express from "express"
import { create_Order, get_all_orders_by_user_id, get_order_item_details } from "../../Controller/orderController.js"
const order_Route = express.Router()

order_Route.post("/",create_Order)

order_Route.get("/",get_all_orders_by_user_id)

order_Route.get("/:id",get_order_item_details)



export default order_Route