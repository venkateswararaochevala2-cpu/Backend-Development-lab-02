const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function initializeDatabase() {
  const database = await open({
    filename: path.join(__dirname, "bookStore.db"),
    driver: sqlite3.Database,
  });

  await database.exec(`
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY,
      title TEXT,
      author TEXT,
      price INTEGER,
      pages INTEGER
    )
  `);

  return database;
}

module.exports = { initializeDatabase };