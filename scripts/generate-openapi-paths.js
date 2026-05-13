/**
 * Scans Express route files and writes OpenAPI paths to openapi.autogen.json.
 * Run after adding/changing routes: npm run openapi:generate
 *
 * Does not replace rich schemas in openapi.js — getOpenApiSpec() merges these paths.
 */
const path = require("path");
const swaggerAutogen = require("swagger-autogen")({
  openapi: "3.0.3",
  disableLogs: false,
});

const root = path.join(__dirname, "..");
const outputFile = path.join(root, "src/docs/openapi.autogen.json");

const endpointsFiles = [path.join(root, "src/app.js")];

const doc = {
  info: {
    title: "Digital Delivery API (autogen paths)",
    version: "1.0.0",
    description: "Auto-detected paths; merged at runtime with openapi.js.",
  },
  servers: [],
  components: {},
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Wrote", outputFile);
});
