import {Router} from 'express'
import { auth_Admin_login } from '../Controller/adminAuth.js'
import { block_user, delete_user, fetch_all_users } from '../Controller/userController.js'
import verifyAdmin from '../Middleware/verifyAdmin.js'
import jwtVerify from '../Middleware/jwtVerify.js'
import { add_to_category, delete_category, edit_category, get_categories, soft_Delete_category } from '../Controller/categoryController.js'
import { products } from '../utils/multerStorage.js'
import { add_product, delete_Product, edit_product, get_Product_Details, get_Products, product_Soft_Delete } from '../Controller/productController.js'

const admin_Route = Router()


// auth routes
admin_Route.post("/auth/login",auth_Admin_login)

// fecth all users

admin_Route.get("/users",jwtVerify, verifyAdmin,fetch_all_users)

// block user

admin_Route.patch("/block-user/:id",jwtVerify, verifyAdmin,block_user)

// delete user

admin_Route.delete("/delete-user/:id",jwtVerify, verifyAdmin,delete_user)

// add category

admin_Route.post("/add-category",jwtVerify,verifyAdmin,add_to_category)

// get all categories 

admin_Route.get("/category",jwtVerify,verifyAdmin,get_categories)

// edit category 

admin_Route.patch("/edit-category",jwtVerify,verifyAdmin,edit_category)

// delete category

admin_Route.delete("/delete-category/:id",jwtVerify,verifyAdmin,delete_category)

// soft delete category

admin_Route.patch("/category/soft-delete",jwtVerify,verifyAdmin,soft_Delete_category)

// add products

admin_Route.post("/products",jwtVerify,verifyAdmin,products.array("images[]"),add_product)


// fetch all products 

admin_Route.get("/products",jwtVerify,verifyAdmin,get_Products)

// soft delete product

admin_Route.patch("/products/soft-delete",jwtVerify,verifyAdmin,product_Soft_Delete)



// get product details

admin_Route.get("/products/:id",jwtVerify,verifyAdmin,get_Product_Details)

// edit product

admin_Route.patch("/products/:id",jwtVerify,verifyAdmin,products.array("images[]"),edit_product)


// delete

admin_Route.delete("/products/:id",jwtVerify,verifyAdmin,delete_Product)




export default admin_Route 