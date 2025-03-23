import express from "express";
import {
  addNewAddress,
  deleteAddress,
  getAddressById,
  getAllAddress,
  setDefaultAddress,
  updateAddress,
} from "../../Controller/userController.js";
const addressRoute = express.Router();
addressRoute.post("/", addNewAddress);
addressRoute.patch("/:id/default", setDefaultAddress);
addressRoute.get("/", getAllAddress);
addressRoute.get("/:id", getAddressById);
addressRoute.patch("/:id", updateAddress);
addressRoute.delete("/:id", deleteAddress);

export default addressRoute;
