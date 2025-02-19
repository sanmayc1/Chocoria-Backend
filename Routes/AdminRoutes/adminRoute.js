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

const adminRoute = Router();

// auth routes
adminRoute.post("/auth/login",authAdminLogin);

// fecth all users

adminRoute.get("/users", jwtVerify, verifyAdmin,getAllUsers);

// block user

adminRoute.patch("/block-user/:id", jwtVerify, verifyAdmin,softDeleteUser);

// delete user

adminRoute.delete("/delete-user/:id", jwtVerify, verifyAdmin,deleteUser);

// add category

adminRoute.post("/add-category", jwtVerify, verifyAdmin,addCategory);

// get all categories

adminRoute.get("/category", jwtVerify, verifyAdmin,getCategories);

// edit category

adminRoute.patch("/edit-category", jwtVerify, verifyAdmin,editCategory);

// delete category

adminRoute.delete(
  "/delete-category/:id",
  jwtVerify,
  verifyAdmin,
  deleteCategory
);

// soft delete category

adminRoute.patch(
  "/category/soft-delete",
  jwtVerify,
  verifyAdmin,
  softDeleteCategory
);

// add products

adminRoute.post(
  "/products",
  jwtVerify,
  verifyAdmin,
  products.array("images[]"),
  addProduct
);

// fetch all products

adminRoute.get("/products", jwtVerify, verifyAdmin, getProducts);

// soft delete product

adminRoute.patch(
  "/products/soft-delete",
  jwtVerify,
  verifyAdmin,
  softDeleteProduct
);

// get product details

adminRoute.get("/products/:id", jwtVerify, verifyAdmin,getProductDetails);

// edit product

adminRoute.patch(
  "/products/:id",
  jwtVerify,
  verifyAdmin,
  products.array("images[]"),
  editProduct
);

// delete

adminRoute.delete("/products/:id", jwtVerify, verifyAdmin,deleteProduct);

// order

adminRoute.use("/orders", jwtVerify, verifyAdmin, adminOrderRoute);

export default adminRoute;
