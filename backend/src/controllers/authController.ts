import { createSupabaseClient } from "../config/supabase";
import { Request, Response } from "express";
import { z } from "zod";
import type { CookieOptions } from "express";
import { sendServerError } from "../utils/sendServerError";
import { AuthRequest } from "../types/authrequest";

const signUpSchema = z.object({
	email: z.email(),
	password: z.string().min(6),
	username: z.string().min(1),
	full_name: z.string().min(1),
});

const signInSchema = z.object({
	email: z.email(),
	password: z.string().min(6),
});

const updateProfileSchema = z.object({
	full_name: z.string().min(1),
	bio: z.string().optional(),
	street: z.string().optional(),
	district: z.string().optional(),
	distric: z.string().optional(),
	city: z.string().optional(),
	phone: z.string().optional(),
});

function getAccessTokenCookieOptions(): CookieOptions {
	const isProduction = process.env.NODE_ENV === "production";
	const cookieDomain = process.env.COOKIE_DOMAIN?.trim();

	return {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		maxAge: 1000 * 60 * 60,
		domain: cookieDomain || undefined,
		path: "/",
	};
}

function getRefreshTokenCookieOptions(): CookieOptions {
	const isProduction = process.env.NODE_ENV === "production";
	const cookieDomain = process.env.COOKIE_DOMAIN?.trim();

	return {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		maxAge: 1000 * 60 * 60 * 24 * 30,
		domain: cookieDomain || undefined,
		path: "/",
	};
}

// Đăng ký tài khoản
export async function signUp(req: Request, res: Response): Promise<void> {
	try {
		const parsed = signUpSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}

		const { email, password, username, full_name } = parsed.data;

		const { data, error } = await createSupabaseClient().auth.signUp({
			email: email,
			password: password,
			options: {
				data: {
					username: username,
					full_name: full_name,
					role: "user",
				},
			},
		});

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
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
		const parsed = signInSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}

		const { email, password } = parsed.data;

		const { data, error } = await createSupabaseClient().auth.signInWithPassword({
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

		if (!data.session) {
			res.status(401).json({
				success: false,
				message: "No session returned",
			});
			return;
		}

		const token = data.session.access_token;
		const refreshToken = data.session.refresh_token;

		res.cookie("access_token", token, getAccessTokenCookieOptions());
		res.cookie("refresh_token", refreshToken, getRefreshTokenCookieOptions());
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
		// ADMIN REVOKE

		// const token = req.cookies.access_token;
		// if (!token) {
		// 	res.status(400).json({
		// 		success: false,
		// 		message: "There is no session to signout",
		// 	});
		// 	return;
		// }

		// const { error } = await supabaseService.auth.admin.signOut(token, "global");
		// if (error) {
		// 	res.status(400).json({
		// 		success: false,
		// 		message: error.message,
		// 	});
		// 	return;
		// }

		// Xóa cookies
		res.clearCookie("access_token", getAccessTokenCookieOptions());
		res.clearCookie("refresh_token", getRefreshTokenCookieOptions());
		res.status(200).json({
			success: true,
			message: "Signout success",
		});
	} catch (e) {
		console.error("Signout error:", e);
		sendServerError(res);
	}
}

export async function refreshSession(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const refreshToken = req.cookies.refresh_token;
		if (!refreshToken) {
			res.status(401).json({
				success: false,
				message: "There is no refresh session, please signin.",
			});
			return;
		}

		const { data, error } = await createSupabaseClient().auth.refreshSession({
			refresh_token: refreshToken,
		});

		if (error || !data.session) {
			res.clearCookie("access_token", getAccessTokenCookieOptions());
			res.clearCookie("refresh_token", getRefreshTokenCookieOptions());
			res.status(401).json({
				success: false,
				message: error?.message || "Failed to refresh session",
			});
			return;
		}

		res.cookie(
			"access_token",
			data.session.access_token,
			getAccessTokenCookieOptions(),
		);
		res.cookie(
			"refresh_token",
			data.session.refresh_token,
			getRefreshTokenCookieOptions(),
		);

		res.status(200).json({
			success: true,
			user: data.user,
		});
	} catch (e) {
		console.error("Refresh session error:", e);
		sendServerError(res);
	}
}

export async function getUserInfo(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const user_id = req.user.id;

		const { data, error } = await createSupabaseClient().from("profiles")
			.select("*")
			.eq("user_id", user_id)
			.single();

		if (error) {
			res.status(404).json({
				success: false,
				message: "User profile not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			user: data,
		});
	} catch (e) {
		console.error("Get user info error:", e);
		sendServerError(res);
	}
}

export async function getUserInfoById(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { id } = req.params;

		const { data, error } = await createSupabaseClient().from("profiles_public")
			.select("*")
			.eq("user_id", id)
			.single();

		if (error) {
			res.status(404).json({
				success: false,
				message: "User profile not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			user: data,
		});
	} catch (e) {
		console.error("Get user info error:", e);
		sendServerError(res);
	}
}

export async function updateProfile(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const parsed = updateProfileSchema.safeParse(req.body ?? {});
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}

		const { full_name, bio, street, district, distric, city, phone } =
			parsed.data;
		const updates: Record<string, string | null> = {};
		const normalize = (value?: string) => {
			if (value === undefined) return undefined;
			const trimmed = value.trim();
			return trimmed.length ? trimmed : null;
		};

		const normalizedFullName = normalize(full_name);
		if (normalizedFullName !== undefined) {
			updates.full_name = normalizedFullName;
		}
		const normalizedBio = normalize(bio);
		if (normalizedBio !== undefined) {
			updates.bio = normalizedBio;
		}
		const normalizedStreet = normalize(street);
		if (normalizedStreet !== undefined) {
			updates.street = normalizedStreet;
		}
		const normalizedDistrict = normalize(district ?? distric);
		if (normalizedDistrict !== undefined) {
			updates.district = normalizedDistrict;
		}
		const normalizedCity = normalize(city);
		if (normalizedCity !== undefined) {
			updates.city = normalizedCity;
		}
		const normalizedPhone = normalize(phone);
		if (normalizedPhone !== undefined) {
			updates.phone = normalizedPhone;
		}

		if (req.file) {
			const file = req.file as Express.Multer.File;
			const fileName = `${Date.now()}-${Math.random()
				.toString(36)
				.substring(7)}-${file.originalname}`;
			const filePath = `avatars/${req.user.id}/${fileName}`;

			const { error: uploadError } = await createSupabaseClient().storage
				.from("image")
				.upload(filePath, file.buffer, {
					contentType: file.mimetype,
				});

			if (uploadError) {
				res.status(400).json({
					success: false,
					message: uploadError.message,
				});
				return;
			}

			const { data: publicData } = createSupabaseClient().storage
				.from("image")
				.getPublicUrl(filePath);

			if (!publicData?.publicUrl) {
				res.status(400).json({
					success: false,
					message: "Failed to generate avatar URL",
				});
				return;
			}

			updates.avatar_url = publicData.publicUrl;
		}

		if (Object.keys(updates).length === 0) {
			res.status(400).json({
				success: false,
				message: "No profile fields provided",
			});
			return;
		}

		const { data, error } = await createSupabaseClient().from("profiles")
			.update(updates)
			.eq("user_id", req.user.id)
			.select("*")
			.single();

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			user: data,
		});
	} catch (e) {
		console.error("Update profile error:", e);
		sendServerError(res);
	}
}
