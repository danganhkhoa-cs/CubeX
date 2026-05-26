import express from "express";
import {
	signIn,
	signUp,
	signOut,
	getUserInfo,
	getUserInfoById,
} from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";

export const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.post("/signout", signOut);
authRouter.get("/user", requireAuth, getUserInfo);
authRouter.get("/user/:id", getUserInfoById);
