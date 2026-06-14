const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

// Load environmental parameters
dotenv.config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const blogRoutes = require("./routes/blogRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Initialize Express
const app = express();

// Establish Database Connections
connectDB();

// 1. Core security middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local file uploads from frontend browser viewports
}));

// Enable CORS
app.use(cors({
  origin: "*", // Adjust in production to match frontend domains
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

// Prevent NoSQL query injection — custom middleware avoids express-mongo-sanitize@2.2.0
// read-only getter bug with Express 5 (req.query is not assignable in Express 5)
app.use(function sanitizeNoSql(req, res, next) {
  const FORBIDDEN_KEYS = /^\$|\./;

  function deepClean(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(deepClean);
    const result = {};
    for (const key of Object.keys(obj)) {
      if (!FORBIDDEN_KEYS.test(key)) {
        result[key] = deepClean(obj[key]);
      }
    }
    return result;
  }

  // Only sanitize writable fields — req.query is a getter-only in Express 5
  if (req.body && typeof req.body === 'object') {
    req.body = deepClean(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = deepClean(req.params);
  }

  next();
});

// Rate limiting settings (max 150 requests per 15 minutes per IP address)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes."
  }
});
app.use("/api/", limiter);

// 2. Request body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static uploads catalog exposure
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// 4. Register Route mounts
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/settings", settingsRoutes);

// Base route ping
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Zuri Enterprises Wholesale Sourcing API is operational.",
    version: "1.0.0"
  });
});

// Catch-all route page fallback (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "The requested API route does not exist."
  });
});

// 5. Centralized Error Interceptor
app.use(errorHandler);

module.exports = app;
