import { Response } from "express";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";

export async function getBalance(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await req.supabase
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

		const { data, error } = await req.supabase.rpc("topup", {
			p_amount: amount,
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
