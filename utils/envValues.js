import {config}from "dotenv";
config()

export const PORT = process.env.PORT
export const mongoDb_Url =process.env.MONGO_DB_URL
export const Email = process.env.Email
export const Password = process.env.Password
export const SECRET_KEY = process.env.SECRET_KEY
export const FRONTEND_URL = process.env.FRONTEND_URL