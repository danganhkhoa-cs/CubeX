import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { createOrder } from "../controllers/orderController";

export const orderRouter = Router();

orderRouter.post("/", requireAuth, createOrder);
