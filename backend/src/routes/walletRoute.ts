import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { getBalance, topUp } from "../controllers/walletController";

export const walletRouter = Router();

walletRouter.get("/balance", requireAuth, getBalance);
walletRouter.post("/topup", requireAuth, topUp);
