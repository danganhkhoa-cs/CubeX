import { Response } from "express";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { supabase } from "../config/supabase";

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
		const wallet_id = req.user.id;

		// ZOD VALIDATION

		const { data, error } = await supabase.rpc("create_transaction", {
			p_wallet_id: wallet_id,
			p_order_id: null,
			p_amount: amount,
			p_type: "deposit",
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
			transaction: data[0],
		});
	} catch (e) {
		console.error("Top up error", e);
		sendServerError(res);
	}
}
