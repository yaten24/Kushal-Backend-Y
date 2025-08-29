import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import quizRoute from "./routes/quiz.route.js";
import db_connect from "./database/db.connect.js";

// Load environment variables early
dotenv.config();

// ===== App Initialization =====
const app = express();

// ===== Middlewares =====
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== Health Check Route =====
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is ready for Kusal Youth 🚀",
    });
});

// ===== API Routes =====
app.use("/api/v1/user", userRoute);
app.use("/api/v1/quiz", quizRoute);

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
    console.error("Error:", err.stack || err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// ===== Server Starter =====
const startServer = async () => {
    try {
        await db_connect();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};

startServer();

