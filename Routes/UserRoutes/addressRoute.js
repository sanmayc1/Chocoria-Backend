import express from "express";
import { add_new_address, delete_address, get_address_by_id, get_all_address, update_address } from "../../Controller/userController.js";
const address_Route = express.Router()

address_Route.post("/",add_new_address)

address_Route.get("/",get_all_address)

address_Route.get("/:id",get_address_by_id)

address_Route.patch("/:id",update_address)

address_Route.delete("/:id",delete_address)

export default address_Route