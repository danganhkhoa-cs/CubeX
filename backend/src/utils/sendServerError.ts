import { Response } from "express";

export function sendServerError(res: Response): void {
	res.status(500).json({
		success: false,
		message: "Internal server error",
	});
}
