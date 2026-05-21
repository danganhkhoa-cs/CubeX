import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { supabase } from "../config/supabase";

const createOrderSchema = z.object({
	product_id: z.uuid(),
	shipping_name: z.string().min(1),
	shipping_phone: z.coerce.string().min(1),
	shipping_street: z.string().min(1),
	shipping_district: z.string().min(1),
	shipping_city: z.string().min(1),
	shipping_note: z.string().optional().nullable(),
});

const raiseDisputeSchema = z.object({
	reason: z.string().min(1),
	evidence_urls: z.array(z.string().min(1)),
});

export async function createOrder(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const buyer_id = req.user.id;
		const parsed = createOrderSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}

		const {
			product_id,
			shipping_name,
			shipping_phone,
			shipping_street,
			shipping_district,
			shipping_city,
			shipping_note,
		} = parsed.data;

		const shipping_info = {
			name: shipping_name,
			phone: shipping_phone,
			street: shipping_street,
			district: shipping_district,
			city: shipping_city,
			note: shipping_note,
		};

		const { data, error } = await supabase.rpc("purchase_product", {
			p_product_id: product_id,
			p_buyer_id: buyer_id,
			p_shipping_info: shipping_info,
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
			tracking_id: data,
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
			const { data, error } = await supabase
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
			const { data, error } = await supabase
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
		const { tracking_id } = req.params;
		const user_id = req.user.id;

		const { data, error } = await supabase.rpc("get_order_by_tracking_id", {
			p_tracking_id: tracking_id,
			p_user_id: user_id,
		});

		if (error) {
			res.status(404).json({
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

export async function updateOrderStatus(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { tracking_id } = req.params;
		const { status } = req.body;
		const user_id = req.user.id;

		const { data, error } = await supabase.rpc("update_order_status", {
			p_user_id: user_id,
			p_tracking_id: tracking_id,
			p_status: status,
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
		console.error("Update status error:", e);
		sendServerError(res);
	}
}

export async function shippingProduct(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { tracking_id } = req.params;
		const user_id = req.user.id;

		const { data, error } = await supabase.rpc("update_order_status", {
			p_user_id: user_id,
			p_tracking_id: tracking_id,
			p_status: "shipping",
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
		console.error("Shipping product error:", e);
		sendServerError(res);
	}
}

export async function confirmShipping(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { tracking_id } = req.params;
		const user_id = req.user.id;

		const { data, error } = await supabase.rpc("update_order_status", {
			p_user_id: user_id,
			p_tracking_id: tracking_id,
			p_status: "shipped",
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
		console.error("Confirm shipping error:", e);
		sendServerError(res);
	}
}

export async function cancelOrder(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { tracking_id } = req.params;
		const user_id = req.user.id;

		const { data, error } = await supabase.rpc("update_order_status", {
			p_user_id: user_id,
			p_tracking_id: tracking_id,
			p_status: "cancelled",
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
		console.error("Cancel order error:", e);
		sendServerError(res);
	}
}

export async function confirmReceived(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { tracking_id } = req.params;
		const user_id = req.user.id;

		const { data, error } = await supabase.rpc("update_order_status", {
			p_user_id: user_id,
			p_tracking_id: tracking_id,
			p_status: "completed",
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
		console.error("Confirm received error:", e);
		sendServerError(res);
	}
}

export async function raiseDispute(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { tracking_id } = req.params;
		const buyer_id = req.user.id;
		const parsed = raiseDisputeSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}

		const { reason, evidence_urls } = parsed.data;

		// Get order by tracking_id
		const { data: orderData, error: orderError } = await supabase.rpc(
			"get_order_by_tracking_id",
			{
				p_tracking_id: tracking_id,
				p_user_id: buyer_id,
			},
		);

		if (orderError || !orderData) {
			res.status(404).json({
				success: false,
				message: "Order not found",
			});
			return;
		}

		const order_id = orderData.id;

		// Update order status to disputed
		const { error: statusError } = await supabase.rpc("update_order_status", {
			p_user_id: buyer_id,
			p_tracking_id: tracking_id,
			p_status: "disputed",
		});

		if (statusError) {
			console.error("Error updating order status:", statusError);
			res.status(400).json({
				success: false,
				message: statusError.message,
			});
			return;
		}

		// Create dispute record
		const { data, error } = await supabase
			.from("disputes")
			.insert([
				{
					order_id: order_id,
					buyer_id: buyer_id,
					reason: reason,
					evidence_urls: evidence_urls,
				},
			])
			.select();

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(201).json({
			success: true,
			dispute: data[0],
		});
	} catch (e) {
		console.error("Raise dispute error:", e);
		sendServerError(res);
	}
}
