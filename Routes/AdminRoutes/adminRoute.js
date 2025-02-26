import { Router } from "express";
import { authAdminLogin } from "../../Controller/adminAuth.js";
import {
  softDeleteUser,
  deleteUser,
  getAllUsers,
} from "../../Controller/userController.js";
import verifyAdmin from "../../Middleware/verifyAdmin.js";
import jwtVerify from "../../Middleware/jwtVerify.js";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
  softDeleteCategory,
} from "../../Controller/categoryController.js";
import { products } from "../../utils/multerStorage.js";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getProductDetails,
  getProducts,
  softDeleteProduct,
} from "../../Controller/productController.js";
import adminOrderRoute from "./orderRoutes.js";
import AdmincouponRoute from "./couponRoute.js";
import { addOffer, getAllOffers } from "../../Controller/offerController.js";

const adminRoute = Router();

adminRoute.post("/auth/login", authAdminLogin);

adminRoute.get("/users", jwtVerify, verifyAdmin, getAllUsers);

adminRoute.patch("/block-user/:id", jwtVerify, verifyAdmin, softDeleteUser);

adminRoute.delete("/delete-user/:id", jwtVerify, verifyAdmin, deleteUser);

adminRoute.post("/add-category", jwtVerify, verifyAdmin, addCategory);

adminRoute.get("/category", jwtVerify, verifyAdmin, getCategories);

adminRoute.patch("/edit-category", jwtVerify, verifyAdmin, editCategory);

adminRoute.delete(
  "/delete-category/:id",
  jwtVerify,
  verifyAdmin,
  deleteCategory
);

adminRoute.patch(
  "/category/soft-delete",
  jwtVerify,
  verifyAdmin,
  softDeleteCategory
);

adminRoute.post(
  "/products",
  jwtVerify,
  verifyAdmin,
  products.array("images[]"),
  addProduct
);

adminRoute.get("/products", jwtVerify, verifyAdmin, getProducts);

adminRoute.patch(
  "/products/soft-delete",
  jwtVerify,
  verifyAdmin,
  softDeleteProduct
);

adminRoute.get("/products/:id", jwtVerify, verifyAdmin, getProductDetails);

adminRoute.patch(
  "/products/:id",
  jwtVerify,
  verifyAdmin,
  products.array("images[]"),
  editProduct
);

adminRoute.delete("/products/:id", jwtVerify, verifyAdmin, deleteProduct);

adminRoute.post("/offer", jwtVerify, verifyAdmin, addOffer);
adminRoute.get("/offers", jwtVerify, verifyAdmin, getAllOffers);

adminRoute.use("/orders", jwtVerify, verifyAdmin, adminOrderRoute);

adminRoute.use("/coupon", jwtVerify, verifyAdmin, AdmincouponRoute);


export default adminRoute;
