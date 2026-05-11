import { Router } from "express";
import {
	createProduct,
	getAllProducts,
	getProductById,
	updateProductById,
	deleteProduct,
	getProductSpecs,
	getProductBrands,
	getProductCategories,
} from "../controllers/productController";
import { requireAuth } from "../middlewares/authMiddleware";

export const productRouter = Router();

productRouter.post("/", requireAuth, createProduct);

productRouter.get("/", getAllProducts);
productRouter.post("/filter", getAllProducts);
productRouter.get("/specs", getProductSpecs);
productRouter.get("/brands", getProductBrands);
productRouter.get("/types", getProductCategories);

productRouter.get("/:id", getProductById);
productRouter.patch("/:id", requireAuth, updateProductById);
productRouter.delete("/:id", requireAuth, deleteProduct);
