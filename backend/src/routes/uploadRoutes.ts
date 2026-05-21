import { Router } from "express";
import { upload } from "../config/multer";
import { uploadImages } from "../controllers/uploadController";
import { requireAuth } from "../middlewares/authMiddleware";

export const uploadRouter = Router();

uploadRouter.post("/", requireAuth, upload.array("images", 10), uploadImages);
