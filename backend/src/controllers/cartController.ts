import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { supabase } from "../config/supabase";

export async function getCartItems(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const user_id = req.user.id;

		const { data, error } = await supabase
			.from("cart_items")
			.select(
				`
				id,
				product_id,
				created_at,
				products (
					id,
                    seller_id,
                    brand_id,
                    category_id,
					title,
					price,
					images,
					is_sold,
					is_deleted
				)
			`,
			)
			.eq("user_id", user_id);

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			cart_items: data,
		});
	} catch (e) {
		console.error("Get cart items error:", e);
		sendServerError(res);
	}
}

export async function addToCart(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const user_id = req.user.id;
		const { product_id } = req.body;

		const { data: product, error: productError } = await supabase
			.from("products")
			.select("is_sold, is_deleted")
			.eq("id", product_id)
			.single();

		if (productError || !product) {
			res.status(404).json({
				success: false,
				message: "Product not found",
			});
			return;
		}

		if (product.is_sold || product.is_deleted) {
			res.status(400).json({
				success: false,
				message: "Product is no longer available",
			});
			return;
		}

		const { data, error } = await supabase
			.from("cart_items")
			.insert([
				{
					user_id,
					product_id,
				},
			])
			.select();

		if (error) {
			res.status(400).json({
				success: false,
				message: "Product is already in cart or an error occurred",
			});
			return;
		}

		res.status(201).json({
			success: true,
			cart_item: data[0],
		});
	} catch (e) {
		console.error("Add to cart error:", e);
		sendServerError(res);
	}
}

export async function removeFromCart(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { productId } = req.params;
		const user_id = req.user.id;

		const { error } = await supabase
			.from("cart_items")
			.delete()
			.eq("user_id", user_id)
			.eq("product_id", productId);

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Product removed from cart",
		});
	} catch (e) {
		console.error("Remove from cart error:", e);
		sendServerError(res);
	}
}

export async function clearCart(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const user_id = req.user.id;

		const { error } = await supabase
			.from("cart_items")
			.delete()
			.eq("user_id", user_id);

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Cart cleared successfully",
		});
	} catch (e) {
		console.error("Clear cart error:", e);
		sendServerError(res);
	}
}
