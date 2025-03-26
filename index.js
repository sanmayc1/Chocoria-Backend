import express from "express";
import { FRONTEND_URL, PORT } from "./utils/envValues.js";
import connectMongose from "./config/ConnectDb/MongoDbConnect.js";
import userRoute from "./Routes/UserRoutes/userRoute.js";
import adminRoute from "./Routes/AdminRoutes/adminRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { Server } from "socket.io";
import { createServer } from "http";
import socketHandler from "./config/Socket/socketHandler.js";

const app = express();
const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

app.use(
  cors({
    origin:FRONTEND_URL,
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
app.use("/img", express.static(path.join(process.cwd(), "img")));

//MongoDb connect
connectMongose();
// specifying routes
app.use("/user", userRoute);
app.use("/admin", adminRoute);
server.listen(PORT, () => console.log(`Server is Running in ${PORT}`));
