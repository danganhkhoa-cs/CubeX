import { Router } from "express";
import { optionalAuth, requireAuth } from "../middlewares/authMiddleware";
import {
	createOrder,
	getOrderById,
	getOrderHistory,
	shippingProduct,
	confirmShipping,
	cancelOrder,
	confirmReceived,
	raiseDispute,
} from "../controllers/orderController";
import { requireAdmin } from "../middlewares/adminMiddleware";

export const orderRouter = Router();

orderRouter.post("/", requireAuth, createOrder);
orderRouter.get("/", requireAuth, getOrderHistory);

orderRouter.get("/:tracking_id", optionalAuth, getOrderById);
orderRouter.post("/:tracking_id/shipping", requireAdmin, shippingProduct);
orderRouter.post("/:tracking_id/shipped", requireAdmin, confirmShipping);
orderRouter.post("/:tracking_id/confirm", requireAuth, confirmReceived);
orderRouter.post("/:tracking_id/cancel", requireAuth, cancelOrder);
orderRouter.post("/:tracking_id/dispute", requireAuth, raiseDispute);
