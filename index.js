import express from "express";
import { PORT } from "./utils/envValues.js";
import connectMongose from "./config/ConnectDb/MongoDbConnect.js";
import user_Route from "./Routes/UserRoutes/userRoute.js";
import admin_Route from "./Routes/adminRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { Server } from "socket.io";
import { createServer } from "http";
import decodeJwt from "./utils/decodeJwt.js";
import socketHandler from "./config/Socket/socketHandler.js";

const app = express();
const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:7000",
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:7000",
    credentials: true,
  })
);

// global variables
export const activeUsers = {};

// socket handler 
socketHandler(io)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use("/img", express.static(path.join(process.cwd(), "img/products")));

//MongoDb connect
connectMongose();

// specifying routes
app.use("/user", user_Route);
app.use("/admin", admin_Route);
server.listen(PORT, () => console.log(`Server is Running in ${PORT}`));
