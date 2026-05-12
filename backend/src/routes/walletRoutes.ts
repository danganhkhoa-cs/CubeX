import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import {
	getBalance,
	topUp,
	withdraw,
	getTransactionHistory,
} from "../controllers/walletController";

export const walletRouter = Router();

walletRouter.get("/balance", requireAuth, getBalance);
walletRouter.get("/transactions", requireAuth, getTransactionHistory);

walletRouter.post("/topup", requireAuth, topUp);
walletRouter.post("/withdraw", requireAuth, withdraw);
