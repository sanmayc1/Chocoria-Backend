import {Router} from 'express'
import { auth_login, auth_SignUp, auth_With_Google, resend_Otp, verify_Otp } from '../Controller/auth.js'
import userDataValidation from '../Middleware/validation.js'
import { add_new_address, delete_address, get_address_by_id, get_all_address, update_address, update_profile, userLogout, userProfile } from '../Controller/userController.js'
import jwtVerify from '../Middleware/jwtVerify.js'
import { get_Product_Details, get_Products } from '../Controller/productController.js'

const user_Route = Router()


// user routes

// user auth routes
user_Route.post("/auth/signup",userDataValidation,auth_SignUp)
user_Route.post("/auth/google",auth_With_Google)
user_Route.patch("/otp",verify_Otp)
user_Route.post("/resend-otp",resend_Otp)
user_Route.post("/auth/login",auth_login)
user_Route.post("/logout",userLogout)

// user profile routes

user_Route.get("/profile",jwtVerify,userProfile) 

user_Route.get("/products",get_Products)

user_Route.get("/products/:id",get_Product_Details)

user_Route.patch("/update-profile",jwtVerify,update_profile)

user_Route.post("/address",jwtVerify,add_new_address)

user_Route.get("/address",jwtVerify,get_all_address)

user_Route.get("/address/:id",jwtVerify,get_address_by_id)

user_Route.patch("/address/:id",jwtVerify,update_address)

user_Route.delete("/address/:id",jwtVerify,delete_address)



export default user_Route 