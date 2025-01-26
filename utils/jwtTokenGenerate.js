import jwt from 'jsonwebtoken'
import { SECRET_KEY } from './envValues.js';
const tokenGenerate=(userDetails)=>{
   
   return jwt.sign(userDetails, SECRET_KEY, { expiresIn: "1h" });
}

export default tokenGenerate;