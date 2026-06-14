import express from "express";
import {
	signIn,
	signUp,
	signOut,
	refreshSession,
	getUserInfo,
	getUserInfoById,
	updateProfile,
} from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";
import { upload } from "../config/multer";

export const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.post("/signout", signOut);
authRouter.post("/refresh", refreshSession);
authRouter.get("/user", requireAuth, getUserInfo);
authRouter.patch("/user", requireAuth, upload.single("avatar"), updateProfile);
authRouter.get("/user/:id", getUserInfoById);
