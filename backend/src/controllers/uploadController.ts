import { Response } from "express";
import { AuthRequest } from "../types/authrequest";
import { sendServerError } from "../utils/sendServerError";
import { createSupabaseClient } from "../config/supabase";

export async function uploadImages(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	try {
		// Check if files are provided
		if (!req.files || req.files.length === 0) {
			res.status(400).json({
				success: false,
				message: "No images provided",
			});
			return;
		}

		const uploadedUrls: string[] = [];
		const errors: { file: string; error: string }[] = [];

		// Process each file
		for (const file of req.files as Express.Multer.File[]) {
			try {
				const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
				const filePath = `images/${fileName}`;

				// Upload to Supabase Storage
				const { data, error } = await createSupabaseClient().storage
					.from("image")
					.upload(filePath, file.buffer, {
						contentType: file.mimetype,
					});

				if (error) {
					errors.push({
						file: file.originalname,
						error: error.message,
					});
					continue;
				}

				// Get public URL
				const { data: publicData } = createSupabaseClient().storage
					.from("image")
					.getPublicUrl(filePath);

				if (publicData?.publicUrl) {
					uploadedUrls.push(publicData.publicUrl);
				}
			} catch (fileError) {
				console.error(`Error uploading file ${file.originalname}:`, fileError);
				errors.push({
					file: file.originalname,
					error: "Failed to upload file",
				});
			}
		}

		// Return response with uploaded URLs and any errors
		if (uploadedUrls.length === 0) {
			res.status(400).json({
				success: false,
				message: "Failed to upload any images",
				errors,
			});
			return;
		}

		res.status(200).json({
			success: true,
			urls: uploadedUrls,
			...(errors.length > 0 && { errors }),
		});
	} catch (e) {
		console.error("Upload error:", e);
		sendServerError(res);
	}
}
