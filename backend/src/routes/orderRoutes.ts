import { Router } from "express";
import { optionalAuth, requireAuth } from "../middlewares/authMiddleware";
import {
	createOrder,
	getOrderById,
	getOrderHistory,
	updateOrderStatus,
} from "../controllers/orderController";

export const orderRouter = Router();

orderRouter.post("/", requireAuth, createOrder);
orderRouter.get("/", requireAuth, getOrderHistory);

orderRouter.get("/:tracking_id", optionalAuth, getOrderById);
orderRouter.patch("/:tracking_id", requireAuth, updateOrderStatus);
