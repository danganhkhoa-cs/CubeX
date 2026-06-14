import { Response, Request } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { createSupabaseClient } from "../config/supabase";

const signUpSchema = z.object({
	email: z.email(),
	password: z.string().min(6),
	username: z.string().min(1),
	full_name: z.string().min(1),
});

const createBrandSchema = z.object({
	name: z.string().trim().min(1),
});

const deleteBrandSchema = z.object({
	id: z.string().trim().min(1),
});

const renameBrandSchema = z.object({
	id: z.string().trim().min(1),
	new_name: z.string().trim().min(1),
});

const createCategorySchema = z.object({
	name: z.string().trim().min(1),
});

const deleteCategorySchema = z.object({
	id: z.string().trim().min(1),
});

const renameCategorySchema = z.object({
	id: z.string().trim().min(1),
	new_name: z.string().trim().min(1),
});

export async function signUpAdmin(req: Request, res: Response): Promise<void> {
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
					role: "admin",
				},
			},
		});

		if (error) {
			res.status(400).json({
				success: false,
				message: error,
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

export async function getAllDisputes(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await createSupabaseClient().from("disputes").select("*");

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			disputes: data,
		});
	} catch (e) {
		console.error("Get disputes error:", e);
		sendServerError(res);
	}
}

export async function resolveDispute(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { resolution, tracking_id } = req.body;

		if (!["refund_buyer", "release_to_seller"].includes(resolution)) {
			res.status(400).json({
				success: false,
				message:
					"Invalid resolution. Must be 'refund_buyer' or 'release_to_seller'",
			});
			return;
		}

		const { data, error } = await createSupabaseClient().rpc("resolve_dispute", {
			p_tracking_id: tracking_id,
			p_resolution: resolution,
		});

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			order: data[0],
		});
	} catch (e) {
		console.error("Resolve dispute error:", e);
		sendServerError(res);
	}
}

export async function getAdminConfig(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await createSupabaseClient().from("system_configs").select("*");

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			config: data,
		});
	} catch (e) {
		console.error("Get config error:", e);
		sendServerError(res);
	}
}

export async function updateAdminConfig(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { id, value } = req.body;

		const { data, error } = await createSupabaseClient().from("system_configs")
			.update({ value })
			.eq("id", id)
			.select();

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			config: data,
		});
	} catch (e) {
		console.error("Update config error:", e);
		sendServerError(res);
	}
}

export async function getAllOrders(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await createSupabaseClient().from("orders")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			orders: data,
		});
	} catch (e) {
		console.error("Get all orders error:", e);
		sendServerError(res);
	}
}

export async function getAllTransactions(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await createSupabaseClient().from("transactions")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			transactions: data,
		});
	} catch (e) {
		console.error("Get all transactions error:", e);
		sendServerError(res);
	}
}

export async function addBrand(req: AuthRequest, res: Response): Promise<void> {
	try {
		const parsed = createBrandSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}
		const { name } = parsed.data;

		const { data, error } = await createSupabaseClient().from("brands")
			.insert([{ name }])
			.select("*");

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(201).json({
			success: true,
			brands: data,
		});
	} catch (e) {
		console.error("Add brand error:", e);
		sendServerError(res);
	}
}

export async function deleteBrand(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const parsed = deleteBrandSchema.safeParse(
			req.params.id ? req.params : req.body,
		);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}
		const { id } = parsed.data;

		const { data, error } = await createSupabaseClient().from("brands")
			.delete()
			.eq("id", id)
			.select("*");

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			brands: data,
		});
	} catch (e) {
		console.error("Delete brand error:", e);
		sendServerError(res);
	}
}

export async function renameBrand(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const parsed = renameBrandSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}
		const { id, new_name } = parsed.data;

		const { data, error } = await createSupabaseClient().from("brands")
			.update({ name: new_name })
			.eq("id", id)
			.select("*");

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			brands: data,
		});
	} catch (e) {
		console.error("Rename brand error:", e);
		sendServerError(res);
	}
}

export async function addCategory(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const parsed = createCategorySchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}
		const { name } = parsed.data;

		const { data, error } = await createSupabaseClient().from("categories")
			.insert([{ name }])
			.select("*");

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(201).json({
			success: true,
			categories: data,
		});
	} catch (e) {
		console.error("Add category error:", e);
		sendServerError(res);
	}
}

export async function deleteCategory(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const parsed = deleteCategorySchema.safeParse(
			req.params.id ? req.params : req.body,
		);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}
		const { id } = parsed.data;

		const { data, error } = await createSupabaseClient().from("categories")
			.delete()
			.eq("id", id)
			.select("*");

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			categories: data,
		});
	} catch (e) {
		console.error("Delete category error:", e);
		sendServerError(res);
	}
}

export async function renameCategory(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const parsed = renameCategorySchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}
		const { id, new_name } = parsed.data;

		const { data, error } = await createSupabaseClient().from("categories")
			.update({ name: new_name })
			.eq("id", id)
			.select("*");

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			categories: data,
		});
	} catch (e) {
		console.error("Rename category error:", e);
		sendServerError(res);
	}
}
