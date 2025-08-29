// ===== Imports =====
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import userRoute from "./routes/user.route.js";
import quizRoute from "./routes/quiz.route.js";
import adminRoute from "./routes/adminQuiz.route.js";
import db_connect from "./database/db.connect.js";

// ===== Load Environment Variables Early =====
dotenv.config();

// ===== App Initialization =====
const app = express();

// ===== Allowed Origins (Local + Production) =====
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // e.g. "https://your-frontend.vercel.app"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ===== Middlewares =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet()); // Security headers
app.use(morgan("dev")); // HTTP request logger

// ===== Rate Limiting (Basic Protection) =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

// ===== Health Check Route =====
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Server is ready for Kushal Youth",
  });
});

// ===== API Routes =====
app.use("/api/v1/user", userRoute);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/admin", adminRoute);

// ===== 404 Handler =====
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

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

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });

    // Graceful Shutdown
    process.on("SIGINT", () => {
      console.log("🛑 SIGINT received. Closing server...");
      server.close(() => {
        console.log("✅ Server closed. Exiting process.");
        process.exit(0);
      });
    });

    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received. Closing server...");
      server.close(() => {
        console.log("✅ Server closed. Exiting process.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
