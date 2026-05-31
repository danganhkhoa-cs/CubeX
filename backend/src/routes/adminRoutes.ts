import { Router } from "express";
import { requireAdmin } from "../middlewares/adminMiddleware";
import {
	getAllDisputes,
	resolveDispute,
	getAdminConfig,
	updateAdminConfig,
	getAllOrders,
	getAllTransactions,
} from "../controllers/adminController";

export const adminRouter = Router();

adminRouter.get("/disputes", requireAdmin, getAllDisputes);
adminRouter.post("/dispute/:tracking_id/resolve", requireAdmin, resolveDispute);
adminRouter.get("/config", requireAdmin, getAdminConfig);
adminRouter.patch("/config", requireAdmin, updateAdminConfig);
adminRouter.get("/orders", requireAdmin, getAllOrders);
adminRouter.get("/transactions", requireAdmin, getAllTransactions);
