import express from "express";
import { PORT } from "./utils/envValues.js";
import connectMongose from "./config/ConnectDb/MongoDbConnect.js";
import user_Route from "./Routes/userRoute.js";
import admin_Route from "./Routes/adminRoute.js";
import cors from 'cors'
import cookieParser from "cookie-parser";
import path from 'path'

const app = express();
app.use(cors(
    {
        origin: "http://localhost:7000",
        credentials: true,
    }
))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser())
app.use("/img", express.static(path.join(process.cwd(), "img/products")));

//MongoDb connect
connectMongose();

// specifying routes
app.use("/user",user_Route)
app.use("/admin",admin_Route)
app.listen(PORT, () => console.log(`Server is Running in ${PORT}`));
