import { supabase } from "../config/supabase";
import { Request, Response } from "express";
import { sendServerError } from "../utils/sendServerError";

// Đăng ký tài khoản
export async function signUp(req: Request, res: Response): Promise<void> {
	try {
		const { email, password, username, full_name } = req.body;

		// ZOD VALIDATION

		const { data, error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				data: {
					username: username,
					full_name: full_name,
				},
			},
		});

		if (error) {
			res.status(400).json({
				success: false,
				error: error.message,
			});
			return;
		}

		res.status(201).json({
			success: true,
			data,
		});
	} catch (e) {
		console.error("Signup error:", e);
		sendServerError(res);
	}
}

// Đăng nhập tài khoản
export async function signIn(req: Request, res: Response): Promise<void> {
	try {
		const { email, password } = req.body;

		// ZOD VALIDATION

		const { data, error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});

		if (error) {
			res.status(401).json({
				success: false,
				message: error.message,
			});
			return;
		}

		const token = data.session.access_token;

		res.cookie("access_token", token, {
			httpOnly: true,
			secure: false,
			sameSite: "lax",
			// secure: true,
			// sameSite: "strict",
			maxAge: 1000 * 60 * 60,
		});
		res.status(200).json({
			success: true,
			user: data.user,
		});
	} catch (e) {
		console.error("Signin error:", e);
		sendServerError(res);
	}
}

// Đăng xuất tài khoản
export async function signOut(req: Request, res: Response): Promise<void> {
	try {
		const token = req.cookies.access_token;
		if (!token) {
			res.status(400).json({
				success: false,
				message: "There is no session to signout",
			});
			return;
		}

		const { error } = await supabase.auth.admin.signOut(token, "global");
		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		// Xóa cookies
		res.clearCookie("access_token");
		res.status(200).json({
			success: true,
			message: "Signout success",
		});
	} catch (e) {
		console.error("Signout error:", e);
		sendServerError(res);
	}
}
