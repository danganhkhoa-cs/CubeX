import { Response } from "express";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { supabase } from "../config/supabase";

export async function getAllDisputes(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await supabase
			.from("orders")
			.select("*")
			.eq("status", "dispute");

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
		const { tracking_id } = req.params;
		const { resolution } = req.body;

		if (!["refund_buyer", "release_to_seller"].includes(resolution)) {
			res.status(400).json({
				success: false,
				message:
					"Invalid resolution. Must be 'refund_buyer' or 'release_to_seller'",
			});
			return;
		}

		const { data, error } = await supabase.rpc("resolve_dispute", {
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
		const { data, error } = await supabase.from("system_configs").select("*");

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

		const { data, error } = await supabase
			.from("system_configs")
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
