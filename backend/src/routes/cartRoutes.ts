import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import {
	getCartItems,
	addToCart,
	removeFromCart,
	clearCart,
} from "../controllers/cartController";

export const cartRouter = express.Router();
cartRouter.get("/", requireAuth, getCartItems);
cartRouter.post("/", requireAuth, addToCart);
cartRouter.delete("/:productId", requireAuth, removeFromCart);
cartRouter.delete("/", requireAuth, clearCart);
