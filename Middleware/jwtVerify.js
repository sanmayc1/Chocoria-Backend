import { SECRET_KEY } from "../utils/envValues.js";
import jwt from 'jsonwebtoken'

const jwtVerify = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token,SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        
        return res.status(403).json({ success: false, message: "Token Expired" });
    }
    }

export default jwtVerify;