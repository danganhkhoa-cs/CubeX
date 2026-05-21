import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
	storage,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB
	},
	fileFilter: (req, file, cb) => {
		// Only accept image files
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Only image files are allowed"));
		}
	},
});
