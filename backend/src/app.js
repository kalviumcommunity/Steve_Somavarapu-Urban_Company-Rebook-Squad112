const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customer.routes");
const bookingRoutes = require("./routes/booking.routes");
const professionalRoutes = require("./routes/professional.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

const app = express();

// CORS configuration supporting comma-separated URLs, Vercel deployments, or wildcards
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const configuredOrigins = frontendUrl.includes(",")
  ? frontendUrl.split(",").map((url) => url.trim())
  : [frontendUrl];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (
        frontendUrl === "*" ||
        configuredOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Root welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "Urban Company One-Click Rebooking API",
    status: "online",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      bookings: "/api/bookings",
      customer: "/api/customer",
      professionals: "/api/professionals"
    }
  });
});

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/professional", professionalRoutes);
app.use("/api/professionals", professionalRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
