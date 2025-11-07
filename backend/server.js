require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payments");

const app = express();

// Basic security headers
app.use(helmet());

const swiftRoutes = require("./routes/Swift");
app.use("/api/swift/submit", swiftRoutes);

// body parsing
app.use(express.json()); // limit payload size
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// sanitize requests
app.use(mongoSanitize({ replaceWith: "_" }));
app.use(xss());

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// CORS - restrict to frontend origin (adjust to your frontend URL)
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "https://localhost:3000",
    credentials: true,
  })
);

// hide x-powered-by
app.disable("x-powered-by");

// routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

// error fallback
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: "Server error" });
});

// connect to DB then start HTTPS server
const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/payments";
mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const PORT = process.env.PORT || 3443;

    // read SSL cert/key (dev). Must exist
    const certPath = process.env.SSL_CERT_PATH || "./certs/certificate.pem";
    const keyPath = process.env.SSL_KEY_PATH || "./certs/privatekey.pem";
    const options = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };

    https.createServer(options, app).listen(PORT, () => {
      console.log(`Secure API running on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
  });
