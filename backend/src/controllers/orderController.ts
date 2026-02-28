import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { sendServerError } from "../utils/sendServerError";
import { supabase } from "../config/supabase";
import { ShippingInfo } from "../types/shippingInfo";
import { purchaseProduct } from "../postgres/purchaseProduct";

export async function createOrder(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const buyer_id = req.user.id;
		const {
			product_id,
			shipping_name,
			shipping_phone,
			shipping_street,
			shipping_district,
			shipping_city,
			shipping_note,
		} = req.body;

		// ZOD VALIDATION

		const shipping_info: ShippingInfo = {
			name: shipping_name,
			phone: shipping_phone,
			street: shipping_street,
			district: shipping_district,
			city: shipping_city,
			note: shipping_note,
		};

		const { data, error } = await purchaseProduct(
			product_id,
			buyer_id,
			shipping_info,
		);

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			order: data,
		});
	} catch (e) {
		console.error("Create order error:", e);
		sendServerError(res);
	}
}
