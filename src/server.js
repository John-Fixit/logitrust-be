const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8002;
const routers = require("./routes/index");

const cors = require("cors");

app.use(
  cors({
    origin: "*",
  }),
);

app.get("/", (req, res) => {
  res.json({ message: "Application responding", status: true });
});

app.use("/api", routers);

app.listen(PORT, () => {
  console.log(`App starting on port: ${PORT}`);
});
