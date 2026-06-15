const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");
const routes = require("./routes");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

// CORS — allow requests from Word Add-in dev server
app.use(
  cors({
    origin: config.cors.origin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Request logging
app.use(morgan("dev"));

// Parse JSON bodies
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/", routes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log("─────────────────────────────────────────");
  console.log("  CE DocuSeal Proxy — Running");
  console.log(`  URL:      http://localhost:${config.port}`);
  console.log(`  Health:   http://localhost:${config.port}/health`);
  console.log(`  Endpoint: POST http://localhost:${config.port}/api/send-proposal`);
  console.log("─────────────────────────────────────────");
});
