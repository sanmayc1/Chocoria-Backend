import express from "express";
import {
  cancelRequestUpdate,
  changeOrderStatus,
  getAllOrders,
  getAllCancelRequests,
  getAllItemsByOrderId,
  getAllDeliveredOrders,
  totalRevenue,
  getAllReturnRequests,
  returnRequestUpdate,
} from "../../Controller/orderController.js";
const adminOrderRoute = express.Router();


adminOrderRoute.get("/", getAllOrders);
adminOrderRoute.patch("/:id", changeOrderStatus);
adminOrderRoute.get("/cancel", getAllCancelRequests);
adminOrderRoute.get("/return",getAllReturnRequests)
adminOrderRoute.get("/delivered", getAllDeliveredOrders);
adminOrderRoute.get("/revenue",totalRevenue);
adminOrderRoute.get("/:id", getAllItemsByOrderId);
adminOrderRoute.patch("/:id/return",returnRequestUpdate)
adminOrderRoute.patch("/:id/cancel", cancelRequestUpdate);

export default adminOrderRoute;
