import { Response } from "express";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { ShippingInfo } from "../types/shippingInfo";

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

		const { data, error } = await req.supabase.rpc("purchase_product", {
			p_product_id: product_id,
			p_shipping_info: shipping_info,
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
			order_id: data,
		});
	} catch (e) {
		console.error("Create order error:", e);
		sendServerError(res);
	}
}

export async function getOrderHistory(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { role } = req.query;
		const user_id = req.user.id;

		if (role === "buyer") {
			const { data, error } = await req.supabase
				.from("orders")
				.select(
					`
					id,
					buyer_id,
					product_id,
					total_amount,
					shipping_info,
					created_at,
					status
				`,
				)
				.eq("buyer_id", user_id);
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

			return;
		}

		if (role === "seller") {
			const { data, error } = await req.supabase
				.from("orders")
				.select(
					`
					id,
					seller_id,
					product_id,
					total_amount,
					shipping_info,
					created_at,
					status
				`,
				)
				.eq("seller_id", user_id);
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

			return;
		}
	} catch (e) {
		console.error("Get order history error:", e);
		sendServerError(res);
	}
}

export async function getOrderById(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { id } = req.params;

		const { data, error } = await req.supabase
			.from("orders")
			.select()
			.eq("id", id)
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
			order: data,
		});
	} catch (e) {
		console.error("Get order by id error:", e);
		sendServerError(res);
	}
}
