import { Router } from "express";
import {
	getAllProducts,
	getProductById,
} from "../controllers/productController";

export const productRouter = Router();

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
