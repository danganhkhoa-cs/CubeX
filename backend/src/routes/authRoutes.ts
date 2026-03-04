import express from "express";
import { signIn, signUp, signOut } from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";

export const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.post("/signout", signOut);
