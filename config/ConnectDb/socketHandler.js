import decodeJwt from "../../utils/decodeJwt.js";
import { activeUsers } from "../../index.js";

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        // find user by token
      const token = socket.request.headers.cookie
        ? socket.request.headers.cookie.split("=")[1]
        : null;
      let userId = null;
    //   
      if (token) {
        const decodedToken = decodeJwt(token);
        userId = decodedToken.id;
        activeUsers[userId] = socket.id;
      }
    // disconnect user
      socket.on("disconnect", () => {
        if (userId) {
          delete activeUsers[userId];
          
        }
        
      });
    
    });
    
}

export default socketHandler;