import mongoose from "mongoose";
import { mongoDb_Url } from "../../utils/envValues.js";

function connectMongose() {
  mongoose
    .connect(mongoDb_Url)
    .then(() => console.log("MongoDb Connected"))
    .catch((err) => console.log(`MongoDb facing connection issues ${err}`));
}

export default connectMongose
