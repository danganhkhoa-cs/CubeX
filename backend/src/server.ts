import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authRouter } from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors());
app.use(cookieParser())
app.use(express.json());
app.get("/api/health", (req, res) => {
	res.json({
		message: "CubeX is running smoothly",
	});
});

app.use("/api/auth", authRouter);

app
	.listen(PORT, () => {
		console.log(`server running at port: ${PORT}`);
	})
	.on("error", (e) => {
		console.error("Failed to start server:", e);
	});
