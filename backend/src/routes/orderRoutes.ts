import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import {
	createOrder,
	getOrderById,
	getOrderHistory,
} from "../controllers/orderController";

export const orderRouter = Router();

orderRouter.post("/", requireAuth, createOrder);
orderRouter.get("/", requireAuth, getOrderHistory);
orderRouter.get("/:id", requireAuth, getOrderById);
