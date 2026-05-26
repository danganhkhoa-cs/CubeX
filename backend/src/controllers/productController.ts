import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { supabase } from "../config/supabase";

const productImageSchema = z.array(z.string().min(1)).nonempty();

const createProductSchema = z.object({
	title: z.string().min(1),
	price: z.coerce.number().int().positive(),
	brand_id: z.uuid(),
	category_id: z.uuid(),
	images: productImageSchema,
	description: z.string().optional().nullable(),
	specs: z.record(z.string(), z.unknown()).optional().nullable(),
});

const updateProductSchema = z.object({
	title: z.string().min(1).optional().nullable(),
	description: z.string().optional().nullable(),
	brand_id: z.uuid().optional().nullable(),
	category_id: z.uuid().optional().nullable(),
	price: z.coerce.number().int().positive().optional().nullable(),
	specs: z.record(z.string(), z.unknown()).optional().nullable(),
	images: productImageSchema.optional().nullable(),
});

export async function getProductSpecs(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await supabase
			.from("system_configs")
			.select("value")
			.eq("id", "specs")
			.single();

		if (error) {
			res.status(404).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			specs: data.value,
		});
	} catch (e) {
		console.error("Get product specs error:", e);
		sendServerError(res);
	}
}

export async function getProductBrands(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await supabase.from("brands").select("*");

		if (error || !data || data.length === 0) {
			res.status(404).json({
				success: false,
				message: "Brands not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			brands: data,
		});
	} catch (e) {
		console.error("Get product brands error:", e);
		sendServerError(res);
	}
}

export async function getProductCategories(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { data, error } = await supabase.from("categories").select("*");

		if (error || !data || data.length === 0) {
			res.status(404).json({
				success: false,
				message: "Categories not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			categories: data,
		});
	} catch (e) {
		console.error("Get product categories error:", e);
		sendServerError(res);
	}
}

export async function createProduct(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const seller_id = req.user.id;
		const parsed = createProductSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}

		const { title, price, brand_id, category_id, images, description, specs } =
			parsed.data;

		const { data, error } = await supabase.from("products").insert([
			{
				seller_id,
				title,
				price,
				brand_id,
				category_id,
				images,
				description: description || null,
				specs: specs || null,
			},
		]).select(`
			id,
			seller_id,
			is_sold,
			title,
			price,
			images,
			brand_id,
			category_id,
			description,
			specs,
			created_at
		`);

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(201).json({
			success: true,
			product: data,
		});
	} catch (e) {
		console.error("Create product error:", e);
		sendServerError(res);
	}
}

export async function getAllProducts(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { seller_id } = req.query;

		const {
			min_price,
			max_price,
			category_id,
			brand_id,
			size,
			weight,
			edition,
			coated_type,
			spring_type,
			magnet_type,
			customization_type,
			core_material,
		} = req.body || {};

		let query = supabase.from("products").select(
			`
            id,
			seller_id,
			title,
			price,
			images,
			brand_id,
			category_id,
			description,
			specs,
			created_at
        `,
		);

		// Filter deleted products
		query = query.eq("is_deleted", false);

		if (seller_id) {
			query = query.eq("seller_id", seller_id);
		} else {
			query = query.eq("is_sold", false);
		}

		// Filter by price
		if (min_price !== null && min_price !== undefined) {
			query = query.gte("price", min_price);
		}
		if (max_price !== null && max_price !== undefined) {
			query = query.lte("price", max_price);
		}

		// Filter by category_id
		if (category_id !== null && category_id !== undefined) {
			query = query.eq("category_id", category_id);
		}

		// Filter by brand_id
		if (brand_id !== null && brand_id !== undefined) {
			query = query.eq("brand_id", brand_id);
		}

		const { data, error } = await query;

		if (error || !data || data.length === 0) {
			res.status(404).json({
				success: false,
				message: "Products not found",
			});
			return;
		}

		// Filter by specs (JSONB fields) client-side
		let filteredData = data;

		const specsFilters = {
			size,
			weight,
			edition,
			coated_type,
			spring_type,
			magnet_type,
			customization_type,
			core_material,
		};

		for (const [key, value] of Object.entries(specsFilters)) {
			if (value !== null && value !== undefined) {
				filteredData = filteredData.filter((product) => {
					if (!product.specs) return false;
					const specValue = product.specs[key];

					// Handle array specs (check if value is in array)
					if (Array.isArray(specValue)) {
						return specValue.includes(value);
					}
					// Handle single value specs
					return specValue === value;
				});
			}
		}

		if (filteredData.length === 0) {
			res.status(404).json({
				success: false,
				message: "No products match the filters",
			});
			return;
		}

		res.status(200).json({
			success: true,
			products: filteredData,
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
                id,
				seller_id,
				is_sold,
				title,
				price,
				images,
				brand_id,
				category_id,
				description,
				specs,
				created_at
            `,
			)
			.eq("id", id)
			.eq("is_deleted", false)
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

export async function updateProductById(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { id } = req.params;
		const seller_id = req.user.id;
		const parsed = updateProductSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: "Invalid request body",
				details: parsed.error.flatten().fieldErrors,
			});
			return;
		}

		const { title, description, brand_id, category_id, price, specs, images } =
			parsed.data;

		// Get product first
		const { data: fetchData, error: fetchError } = await supabase
			.from("products")
			.select("seller_id, is_sold")
			.eq("id", id)
			.eq("is_deleted", false)
			.single();

		if (fetchError) {
			res.status(404).json({
				success: false,
				message: "Product not found",
			});
			return;
		}

		// Check if seller owns this product
		if (fetchData.seller_id !== seller_id) {
			res.status(403).json({
				success: false,
				message: "Unauthorized - you can only update your own products",
			});
			return;
		}

		// Check if product is not sold
		if (fetchData.is_sold) {
			res.status(400).json({
				success: false,
				message: "Cannot update a product that has been sold",
			});
			return;
		}

		// Build update object with only provided fields
		const updateData: any = {};
		if (title !== undefined && title !== null) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (brand_id !== undefined && brand_id !== null)
			updateData.brand_id = brand_id;
		if (category_id !== undefined && category_id !== null)
			updateData.category_id = category_id;
		if (price !== undefined && price !== null) updateData.price = price;
		if (specs !== undefined) updateData.specs = specs;
		if (images !== undefined && images !== null) updateData.images = images;

		if (Object.keys(updateData).length === 0) {
			res.status(400).json({
				success: false,
				message: "No fields to update",
			});
			return;
		}

		const { data, error } = await supabase
			.from("products")
			.update(updateData)
			.eq("id", id).select(`
				id,
				seller_id,
				is_sold,
				title,
				price,
				images,
				brand_id,
				category_id,
				description,
				specs,
				created_at
			`);

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}
		res.status(200).json({
			success: true,
			product: data,
		});
	} catch (e) {
		console.error("Update product error:", e);
		sendServerError(res);
	}
}

export async function deleteProduct(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		const { id } = req.params;
		const seller_id = req.user.id;

		// Get product first
		const { data: product, error: fetchError } = await supabase
			.from("products")
			.select("seller_id, is_deleted")
			.eq("id", id)
			.single();

		if (fetchError) {
			res.status(404).json({
				success: false,
				message: "Product not found",
			});
			return;
		}

		// Check if already deleted
		if (product.is_deleted) {
			res.status(404).json({
				success: false,
				message: "Product not found",
			});
			return;
		}

		// Check if seller owns this product
		if (product.seller_id !== seller_id) {
			res.status(403).json({
				success: false,
				message: "Unauthorized - you can only delete your own products",
			});
			return;
		}

		// Soft delete - set is_deleted to true
		const { error } = await supabase
			.from("products")
			.update({ is_deleted: true })
			.eq("id", id);

		if (error) {
			res.status(400).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (e) {
		console.error("Delete product error:", e);
		sendServerError(res);
	}
}
