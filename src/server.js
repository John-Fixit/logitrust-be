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

/**
 * MySQL allows at most 64 indexes per table (ER_TOO_MANY_KEYS). Sequelize
 * `sync({ alter: true })` can create multiple indexes with the same column
 * sequence under different names. Drop duplicates, preferring a unique index when
 * multiple share the same signature.
 */
const cleanDuplicateIndexesByColumnSignature = async (tableName) => {
  let indexes;
  try {
    [indexes] = await db.sequelize.query(
      `SHOW INDEX FROM \`${tableName}\``,
    );
  } catch {
    return;
  }
  if (!indexes?.length) return;

  const byKeyName = {};
  for (const row of indexes) {
    const kn = row.Key_name;
    if (!kn || kn === "PRIMARY") continue;
    (byKeyName[kn] ||= []).push(row);
  }

  const signatureToKeyNames = new Map();
  for (const [keyName, parts] of Object.entries(byKeyName)) {
    const sorted = [...parts].sort(
      (a, b) => Number(a.Seq_in_index) - Number(b.Seq_in_index),
    );
    const sig = sorted.map((p) => p.Column_name).join(",");
    const list = signatureToKeyNames.get(sig) ?? [];
    list.push(keyName);
    signatureToKeyNames.set(sig, list);
  }

  for (const keyNames of signatureToKeyNames.values()) {
    if (keyNames.length <= 1) continue;
    const scored = keyNames.map((kn) => {
      const parts = byKeyName[kn];
      const isUnique = parts.some((p) => Number(p.Non_unique) === 0);
      return { kn, isUnique };
    });
    scored.sort((a, b) => {
      if (a.isUnique !== b.isUnique) return a.isUnique ? -1 : 1;
      return a.kn.localeCompare(b.kn);
    });
    const keep = scored[0].kn;
    for (const { kn } of scored.slice(1)) {
      await db.sequelize.query(
        `ALTER TABLE \`${tableName}\` DROP INDEX \`${kn}\``,
      );
    }
    if (process.env.NODE_ENV !== "test") {
      console.log(
        `[DB] Dropped ${scored.length - 1} duplicate index(es) on ${tableName} (kept ${keep})`,
      );
    }
  }
};

const cleanDuplicateIndexesAllModels = async () => {
  const seen = new Set();
  for (const name of Object.keys(db)) {
    if (name === "sequelize" || name === "Sequelize") continue;
    const model = db[name];
    const tableName = model?.tableName || model?.options?.tableName;
    if (!tableName || seen.has(tableName)) continue;
    seen.add(tableName);
    await cleanDuplicateIndexesByColumnSignature(tableName);
  }
};

const startServer = async () => {
  try {
    await db.sequelize.authenticate();

    if (process.env.NODE_ENV === "production") {
      console.log("Skipping Sequelize sync in production (use migrations).");
    } else if (process.env.SYNC_DB !== "false") {
      await cleanLegacyDuplicateEmailIndexes();
      await cleanDuplicateIndexesAllModels();
      await db.sequelize.sync({ alter: true });
      console.log(
        "DB synchronized (non-production; set SYNC_DB=false to skip)",
      );
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
