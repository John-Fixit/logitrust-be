require("dotenv").config();
const app = require("./app");
const db = require("./models");

const PORT = process.env.PORT || 8002;

const cleanLegacyDuplicateEmailIndexes = async () => {
  const [indexes] = await db.sequelize.query("SHOW INDEX FROM users");
  const duplicateEmailIndexes = indexes
    .map((index) => index.Key_name)
    .filter(
      (keyName) =>
        keyName &&
        keyName !== "PRIMARY" &&
        (keyName === "email" || keyName.startsWith("email_")),
    );

  // Keep one unique email index, drop extras that accumulated via sync({ alter: true }).
  const indexesToDrop = duplicateEmailIndexes.slice(1);
  for (const indexName of indexesToDrop) {
    await db.sequelize.query(`ALTER TABLE users DROP INDEX \`${indexName}\`;`);
  }
};

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected successfully");

    if (process.env.NODE_ENV === "production") {
      console.log("Skipping Sequelize sync in production (use migrations).");
    } else if (process.env.SYNC_DB !== "false") {
      await cleanLegacyDuplicateEmailIndexes();
      await db.sequelize.sync({ alter: true });
      console.log("DB synchronized (non-production; set SYNC_DB=false to skip)");
    }

    app.listen(PORT, () => {
      console.log(`App starting on port: ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
