import express from "express"
import { createBrand, deleteBrand, getAllBrands, topSellingBrands } from "../../Controller/brandController.js"
import { brands } from "../../utils/multerStorage.js"

const brandRoute = express.Router()

brandRoute.post("/",brands.single("image"),createBrand)
brandRoute.get("/",getAllBrands)
brandRoute.get("/top-selling",topSellingBrands)
brandRoute.delete("/:id",deleteBrand)



export default brandRoute