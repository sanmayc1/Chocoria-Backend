import express from "express";
import { addtocart,deleteFromCart,getAllProductsFromCart,quantityUpdate} from "../../Controller/cartController.js";
const cartRoute = express.Router()


cartRoute.post("/",addtocart)
cartRoute.get("/", getAllProductsFromCart)
cartRoute.patch("/",quantityUpdate)
cartRoute.delete("/",deleteFromCart)

export default cartRoute