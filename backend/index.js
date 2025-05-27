import express from "express";
// import "dontenv/config";
import dotenv from "dotenv";
import { connectDb } from "./db/connectDB.js";
import authRouters from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouters);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Log the error for debugging (important in production)
  console.error(error);

  // Send JSON response (avoids sending stack traces in production)
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }), // Optional: Include stack trace only in dev
  });
});

app.listen(process.env.PORT, () => {
  connectDb();
  console.log("Server running on port:", process.env.PORT);
  console.log("Browse =>", `http://localhost:${process.env.PORT}`);
});
