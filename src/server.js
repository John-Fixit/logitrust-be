const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8002;
const routers = require("./routes/index");

const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("./middleware/errorHandler");
const db = require("./models");

app.use(
  cors({
    origin: "*",
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/test", (req, res) => {
  res.json({ message: "app on", status: true });
});

app.use("/api", routers);

app.use(errorHandler); //error handler config globally

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected successfully");

    // if (process.env.NODE_ENV === "development") {
    await db.sequelize.sync({ alter: true });
    console.log("DB syncronized");
    // }

    //startign the server here
    app.listen(PORT, () => {
      console.log(`App starting on port: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();
