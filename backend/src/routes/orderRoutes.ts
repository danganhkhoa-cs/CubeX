import { Router } from "express";
import { optionalAuth, requireAuth } from "../middlewares/authMiddleware";
import {
	createOrder,
	getOrderById,
	getOrderHistory,
	updateOrderStatus,
	shippingProduct,
	confirmShipping,
	cancelOrder,
	confirmReceived,
	raiseDispute,
} from "../controllers/orderController";

export const orderRouter = Router();

orderRouter.post("/", requireAuth, createOrder);
orderRouter.get("/", requireAuth, getOrderHistory);

orderRouter.get("/:tracking_id", optionalAuth, getOrderById);
orderRouter.patch("/:tracking_id", requireAuth, updateOrderStatus);
orderRouter.post("/:tracking_id/shipping", requireAuth, shippingProduct);
orderRouter.post("/:tracking_id/shipped", requireAuth, confirmShipping);
orderRouter.post("/:tracking_id/confirm", requireAuth, confirmReceived);
orderRouter.post("/:tracking_id/cancel", requireAuth, cancelOrder);
orderRouter.post("/:tracking_id/dispute", requireAuth, raiseDispute);
