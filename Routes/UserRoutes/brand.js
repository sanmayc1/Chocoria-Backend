import express from "express"
import { getAllBrands } from "../../Controller/brandController.js"

const userBrandRoute = express.Router()


userBrandRoute.get("/",getAllBrands)


export default userBrandRoute