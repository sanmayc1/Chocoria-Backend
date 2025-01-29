import multer from "multer";

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      
      cb(null, "./img/products");
    },
    filename: (req, file, cb) => {

      cb(null, Date.now() + file.originalname);
    },
  });

export const products =multer({storage:productStorage})