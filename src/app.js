const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const routers = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { getOpenApiSpec } = require("./docs/openapi");
const { sendMail } = require("./utils/mailer");

const app = express();

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
