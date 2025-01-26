import {Router} from 'express'
import { auth_Admin_login } from '../Controller/adminAuth.js'
import { fetch_all_users } from '../Controller/userController.js'

const admin_Route = Router()


// auth routes
admin_Route.post("/auth/login",auth_Admin_login)

// fecth all users

admin_Route.get("/users",fetch_all_users)





export default admin_Route 