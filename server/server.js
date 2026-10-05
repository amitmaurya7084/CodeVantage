require("dotenv").config();
const validateEnv = require("./utils/validateEnv");
validateEnv();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Trust the first proxy hop (Render/Railway/Vercel/etc. sit behind a load
// balancer) so req.ip and secure cookies work correctly in production.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ---- Database ----
connectDB();

// ---- Security middleware ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(compression()); // gzip responses
app.use(mongoSanitize()); // strips $ and . from req.body/query to prevent NoSQL injection
app.use(xss()); // sanitizes user input from malicious HTML/JS
app.use(hpp()); // prevents HTTP parameter pollution (e.g. ?status=a&status=b tricks)

const isProduction = process.env.NODE_ENV === "production";
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Production: 300 requests per IP per window (configurable via RATE_LIMIT_MAX).
  // Development: effectively unlimited, so repeated refreshes/testing don't lock you out.
  max: Number(process.env.RATE_LIMIT_MAX) || (isProduction ? 300 : 5000),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter);

// ---- Core middleware ----
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ---- Health check (also useful as an uptime-monitor / deployment-check target) ----
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CodeVantage API is running.", env: process.env.NODE_ENV });
});

// ---- Route mounts ----
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/admin/auth", require("./routes/adminAuthRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/admin/media", require("./routes/mediaRoutes"));
app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/programs", require("./routes/programRoutes"));
app.use("/api/faqs", require("./routes/faqRoutes"));

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CodeVantage server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
