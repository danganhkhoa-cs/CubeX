import express from "express";
import { signIn, signUp, signOut } from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";

export const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.post("/signout", signOut);

authRouter.get("/me", requireAuth, (req: any, res: any) => {
	res.status(200).json({
		success: true,
		message: "Bạn đã vượt qua được Người Gác Cổng!",
		user: req.user,
	});
});
