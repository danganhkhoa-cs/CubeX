import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { supabase } from "../config/supabase";

const amountSchema = z.object({
	amount: z.coerce.number().int().positive(),
});

export async function getBalance(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const user_id = req.user.id;

		const { data, error } = await supabase
			.from("wallets")
			.select("balance")
			.eq("id", user_id)
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
		const parsed = amountSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}

		const { amount } = parsed.data;
		const wallet_id = req.user.id;

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

export async function withdraw(req: AuthRequest, res: Response): Promise<void> {
	try {
		const parsed = amountSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}

		const { amount } = parsed.data;
		const wallet_id = req.user.id;

		const { data, error } = await supabase.rpc("create_transaction", {
			p_wallet_id: wallet_id,
			p_order_id: null,
			p_amount: amount,
			p_type: "withdraw",
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
		console.error("Withdraw error", e);
		sendServerError(res);
	}
}

// controllers/walletController.ts
export async function getTransactionHistory(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const wallet_id = req.user.id;

		const { data, error } = await supabase
			.from("transactions")
			.select("id, order_id, amount, type, created_at")
			.eq("wallet_id", wallet_id)
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
		console.error("Get transaction history error", e);
		sendServerError(res);
	}
}
