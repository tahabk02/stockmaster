import { Platform } from "react-native";

let db: any = null;

if (Platform.OS !== "web") {
  const SQLite = require("expo-sqlite");
  db = SQLite.openDatabaseSync("stockmaster.db");
}

export const initDB = () => {
  if (Platform.OS === "web" || !db) return;
  db.execSync(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      data TEXT,
      updated_at INTEGER
    )
  `);
};

export const saveClientToCache = (id: string, data: any) => {
  if (Platform.OS === "web" || !db) return;
  db.runSync(
    "INSERT OR REPLACE INTO clients (id, data, updated_at) VALUES (?, ?, ?)",
    [id, JSON.stringify(data), Date.now()]
  );
};

export const getCachedClients = () => {
  if (Platform.OS === "web" || !db) return [];
  const result = db.getAllSync("SELECT data FROM clients ORDER BY updated_at DESC");
  return result.map((row: any) => JSON.parse(row.data));
};

export const clearClientCache = () => {
  if (Platform.OS === "web" || !db) return;
  db.execSync("DELETE FROM clients");
};

export default db;
