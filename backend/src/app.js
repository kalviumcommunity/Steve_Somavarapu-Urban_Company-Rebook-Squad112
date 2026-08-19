const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customer.routes");
const bookingRoutes = require("./routes/booking.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");
const { initializeFirebase } = require("./config/firebase");

const app = express();

// Initialize Firebase Admin SDK
const firebaseAuth = initializeFirebase();
if (!firebaseAuth && process.env.STRICT_FIREBASE_INIT === "true") {
  console.error("[Fatal Error] Firebase initialization failed. Terminating startup.");
  process.exit(1);
}

// CORS configuration using FRONTEND_URL
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = frontendUrl.includes(",")
  ? frontendUrl.split(",").map((url) => url.trim())
  : frontendUrl;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/bookings", bookingRoutes);


// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
