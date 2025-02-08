import {Router} from 'express'
import { auth_login, auth_SignUp, auth_With_Google, resend_Otp, verify_Otp } from '../../Controller/auth.js'
import userDataValidation from '../../Middleware/validation.js'
import {  update_profile, userLogout, userProfile } from '../../Controller/userController.js'
import jwtVerify from '../../Middleware/jwtVerify.js'
import cart_Route from './cartRoute.js'
import address_Route from './addressRoute.js'
import product_Route from './productsRoutes.js'
import order_Route from './OrderRoutes.js'
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
user_Route.patch("/update-profile",jwtVerify,update_profile)

//  product routes

user_Route.use("/products",product_Route)

// Address routes

user_Route.use("/address",jwtVerify,address_Route)

//  Cart routes 

user_Route.use("/cart",jwtVerify,cart_Route)

// order routes

user_Route.use("/order",jwtVerify,order_Route)






export default user_Route 