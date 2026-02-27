import { Response, Request, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { sendServerError } from "../utils/sendServerError";

export interface AuthRequest extends Request {
	user?: any;
}

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

		const { data, error } = await supabase.auth.getUser(token);
		if (error) {
			res.status(401).json({
				success: false,
				message: "Access is denied: The session is expired",
			});
			return;
		}

		req.user = data.user;
		next();
	} catch (e) {
		console.error("Auth middleware error:", e);
		sendServerError(res);
	}
}
