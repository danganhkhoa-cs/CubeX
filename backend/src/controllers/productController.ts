import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { sendServerError } from "../utils/sendServerError";

export async function getAllProducts(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await supabase.from("products").select(
			`
                id, seller_id, is_sold, title, description, price, images, specs,
                brand:brands (*),
                category:categories (*)
            `,
		);
		if (error || data.length == 0) {
			res.status(404).json({
				success: false,
				message: "Products not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			products: data,
		});
	} catch (e) {
		console.error("Get all products error:", e);
		sendServerError(res);
	}
}

export async function getProductById(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { id } = req.params;

		const { data, error } = await supabase
			.from("products")
			.select(
				`
                id, seller_id, is_sold, title, description, price, images, specs,
                brand:brands (*),
                category:categories (*)
            `,
			)
			.eq("id", id)
			.single();
		if (error) {
			res.status(404).json({
				success: false,
				message: "Product not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			product: data,
		});
	} catch (e) {
		console.error("Get product by id error:", e);
		sendServerError(res);
	}
}
