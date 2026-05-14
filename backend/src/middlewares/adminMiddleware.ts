import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { supabase } from "../config/supabase";

export async function requireAdmin(
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

		const userId = data.user.id;
		console.log("Admin middleware - user ID:", userId);

		const { data: profileData, error: profileError } = await supabase
			.from("profiles")
			.select("role")
			.eq("user_id", userId)
			.single();

		if (profileError || !profileData) {
			res.status(403).json({
				success: false,
				message: "User profile not found",
			});
			return;
		}

		if (profileData.role !== "admin") {
			res.status(403).json({
				success: false,
				message: "Access denied",
			});
			return;
		}

		req.user = data.user;
		next();
	} catch (e) {
		console.error("Admin middleware error:", e);
		sendServerError(res);
	}
}
