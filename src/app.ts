import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { type Request, type Response } from "express";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:3000",
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Blocked by CORS"));
            }
        },
        credentials: true
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import userRoute from "./routes/user.route.js";
import { apiResponse } from "./utils/apiResponse.js";
import videoRoute from "./routes/video.route.js";
import tweetRoute from "./routes/tweet.route.js";

app.use("/api", userRoute);
app.use("/api", videoRoute);
app.use("/api", tweetRoute);
app.use("/*splat", (req: Request, res: Response) => {
    return res.status(404).json(
        apiResponse({
            statusCode: 404,
            message: `Page ${req.originalUrl} Not Found!`,
            success: false
        })
    );
});

export { app };
