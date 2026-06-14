import { Router } from "express";
import { requireAdmin } from "../middlewares/adminMiddleware";
import {
	getAllDisputes,
	resolveDispute,
	getAdminConfig,
	updateAdminConfig,
	getAllOrders,
	getAllTransactions,
	addBrand,
	deleteBrand,
	renameBrand,
	addCategory,
	deleteCategory,
	renameCategory,
	signUpAdmin,
} from "../controllers/adminController";

export const adminRouter = Router();

adminRouter.post("/signup", requireAdmin, signUpAdmin);

adminRouter.get("/disputes", requireAdmin, getAllDisputes);
adminRouter.post("/dispute/:tracking_id/resolve", requireAdmin, resolveDispute);
adminRouter.get("/config", requireAdmin, getAdminConfig);
adminRouter.patch("/config", requireAdmin, updateAdminConfig);
adminRouter.get("/orders", requireAdmin, getAllOrders);
adminRouter.get("/transactions", requireAdmin, getAllTransactions);

adminRouter.post("/brands", requireAdmin, addBrand);
adminRouter.delete("/brands", requireAdmin, deleteBrand);
adminRouter.patch("/brands", requireAdmin, renameBrand);

adminRouter.post("/categories", requireAdmin, addCategory);
adminRouter.delete("/categories", requireAdmin, deleteCategory);
adminRouter.patch("/categories", requireAdmin, renameCategory);
