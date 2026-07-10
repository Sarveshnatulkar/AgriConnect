const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const routes = require("./routes/index");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow requests from the React dev server and production frontend.
// `credentials: true` is required so cookies are sent cross-origin.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json());                // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse form data

// ─── Cookie Parser ───────────────────────────────────────────────────────────
// Required to read HTTP-only JWT cookies on incoming requests
app.use(cookieParser());

// ─── Request Logger ──────────────────────────────────────────────────────────
// Only log in development to keep production logs clean
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/v1", routes);

// ─── Error Handling ──────────────────────────────────────────────────────────
// Order matters: notFound must come before errorHandler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
