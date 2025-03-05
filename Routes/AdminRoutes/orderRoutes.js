import express from "express";
import {
  cancelRequestUpdate,
  changeOrderStatus,
  getAllOrders,
  getAllCancelRequests,
  getAllItemsByOrderId,
  getAllDeliveredOrders,
  totalRevenue,
} from "../../Controller/orderController.js";
const adminOrderRoute = express.Router();

//Get all orders

adminOrderRoute.get("/", getAllOrders);
adminOrderRoute.patch("/:id", changeOrderStatus);
adminOrderRoute.get("/cancel", getAllCancelRequests);
adminOrderRoute.get("/delivered", getAllDeliveredOrders);
adminOrderRoute.get("/revenue",totalRevenue);
adminOrderRoute.get("/:id", getAllItemsByOrderId);
adminOrderRoute.patch("/:id/cancel", cancelRequestUpdate);

export default adminOrderRoute;
