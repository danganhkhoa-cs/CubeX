import { Response, NextFunction } from "express";
import { createUserClient } from "../config/supabase";
import { sendServerError } from "../utils/sendServerError";
import { AuthRequest } from "../types/authrequest";

export async function requireAuth(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const token = req.cookies.access_token;
		if (!token) {
			res.status(401).json({
				success: false,
				message: "There is no session, please signin.",
			});
			return;
		}

		const supabase = createUserClient(token);

		const { data, error } = await supabase.auth.getUser();
		if (error) {
			res.status(401).json({
				success: false,
				message: "Access is denied: The session is expired",
			});
			return;
		}

		req.user = data.user;
		req.supabase = supabase;
		next();
	} catch (e) {
		console.error("Auth middleware error:", e);
		sendServerError(res);
	}
}
