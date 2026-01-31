require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST, //"127.0.0.1",
    dialect: process.env.DIALECT || "mysql",
    logging: false,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST, //"127.0.0.1",
    dialect: process.env.DIALECT || "mysql",
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST, //"127.0.0.1",
    dialect: process.env.DIALECT || "mysql",
    logging: false,
    DB_PORT: process.env.DB_PORT,
  },
};
