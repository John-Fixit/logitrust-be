const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const routers = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { getOpenApiSpec } = require("./docs/openapi");

const app = express();

// Swagger UI (mounted at /docs below) injects inline <script>/<style> tags that
// helmet's default CSP blocks, so it needs its own relaxed config — skip the
// strict global helmet for that path rather than fighting header precedence.
app.use((req, res, next) => {
  if (req.path.startsWith("/docs")) return next();
  return helmet()(req, res, next);
});

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin && corsOrigin !== "*" ? corsOrigin.split(",") : "*",
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/test", (req, res) => {
  res.json({ message: "app on", status: true });
});

// Tighter limit on auth endpoints — the ones brute-force/credential-stuffing actually targets.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});
app.use("/api/auth", authLimiter);

// Generous general limit — protects against abuse without bothering normal usage.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please slow down" },
});
app.use("/api", apiLimiter);

app.use("/api", routers);

const openApiDocument = getOpenApiSpec();
app.get("/api-docs.json", (req, res) => {
  res.json(openApiDocument);
});
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "Digital Delivery API",
  }),
);

app.use(errorHandler);

module.exports = app;
