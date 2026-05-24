import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authRouter } from "./routes/authRoutes";
import { walletRouter } from "./routes/walletRoutes";
import { productRouter } from "./routes/productRoutes";
import { orderRouter } from "./routes/orderRoutes";
import { adminRouter } from "./routes/adminRoutes";
import { uploadRouter } from "./routes/uploadRoutes";

const app = express();
const PORT = process.env.PORT || 8000;
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "development"
				? "http://localhost:3000"
				: process.env.FRONTEND_URL,
		credentials: true,
		methods: ["GET", "POST", "PATCH", "DELETE"],
	}),
);
app.use(cookieParser());
app.use(express.json());
app.get("/api/health", (req, res) => {
	res.json({
		message: "CubeX is running smoothly",
	});
});

app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/upload", uploadRouter);

app
	.listen(PORT, () => {
		console.log(`server running at port: ${PORT}`);
	})
	.on("error", (e) => {
		console.error("Failed to start server:", e);
	});
