import { SECRET_KEY } from "./envValues.js";
import jwt from 'jsonwebtoken'


const decodeJwt = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded;
    } catch (error) {
        return null;
    }
}

export default decodeJwt