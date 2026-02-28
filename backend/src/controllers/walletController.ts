import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { supabase } from "../config/supabase";
import { sendServerError } from "../utils/sendServerError";
import { createTransaction } from "../postgres/createTransaction";

export async function getBalance(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await supabase
			.from("wallets")
			.select("balance")
			.eq("id", req.user.id)
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
			balance: data.balance,
		});
	} catch (e) {
		console.error("There is problem when getting balance:", e);
		sendServerError(res);
	}
}

export async function topUp(req: AuthRequest, res: Response): Promise<void> {
	try {
		const { amount } = req.body;

		// ZOD VALIDATION

		const { data, error } = await createTransaction(
			req.user.id,
			amount,
			"deposit",
		);
		if (error) {
			res.status(400).json({
				success: false,
				message: "Invalid amount",
			});
			return;
		}

		res.status(200).json({
			success: true,
			new_balance: data,
		});
	} catch (e) {}
}
