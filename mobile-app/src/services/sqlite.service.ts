import { Platform } from "react-native";
import * as Crypto from 'expo-crypto';

let SQLite: any = null;
if (Platform.OS !== "web") {
  SQLite = require("expo-sqlite");
}

class SqliteService {
  private db: any = null;

  async initDatabase() {
    if (Platform.OS === "web" || !SQLite) return;

    try {
      this.db = await SQLite.openDatabaseAsync("stockmaster_pro_v2.db");

      // 1. ASSET_REGISTRY Table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sku TEXT UNIQUE,
          name TEXT NOT NULL,
          price REAL DEFAULT 0,
          quantity INTEGER DEFAULT 0,
          category TEXT,
          metadata TEXT,
          lastSync DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. OFFLINE_TRANSACTION Table (Cart/Buffer)
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS offline_buffer (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL, -- 'SALE', 'TRANSFER', 'ADJUSTMENT'
          payload TEXT NOT NULL,
          status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SYNCED', 'FAILED'
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. FORENSIC_TRACE Table (Audit)
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS forensic_audit (
          id TEXT PRIMARY KEY,
          event TEXT NOT NULL,
          actor TEXT,
          details TEXT,
          severity TEXT DEFAULT 'INFO',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("[NEURAL_SQLITE] Core Engine Initialized: SCHEMA_V2_ACTIVE");
      await this.logEvent("ENGINE_INIT", "SYSTEM", "SQLite core initialized successfully", "INFO");
    } catch (error) {
      console.error("[NEURAL_SQLITE] Critical Failure:", error);
    }
  }

  // --- ASSET MANAGEMENT ---

  async getProductBySku(sku: string) {
    if (Platform.OS === "web" || !this.db) return null;
    try {
      return await this.db.getFirstAsync(
        "SELECT * FROM products WHERE sku = ?",
        [sku]
      );
    } catch (error) {
      this.logEvent("FETCH_ERROR", "DB_QUERY", `Error fetching SKU: ${sku}`, "ERROR");
      return null;
    }
  }

  async upsertProduct(product: any) {
    if (Platform.OS === "web" || !this.db) return;
    try {
      const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || "GENERAL_ASSET");
      const metadata = JSON.stringify(product.metadata || {});
      
      const params = [
        product.sku || "",
        product.name || "UNNAMED_ASSET",
        Number(product.price) || 0,
        Number(product.quantity) || 0,
        categoryName,
        metadata
      ];

      await this.db.runAsync(
        `INSERT OR REPLACE INTO products (sku, name, price, quantity, category, metadata, lastSync) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        params
      );
    } catch (error) {
      console.error("[SQLite] Upsert Failure:", error);
      throw error;
    }
  }

  async getAllProducts() {
    if (Platform.OS === "web" || !this.db) return [];
    try {
      return await this.db.getAllAsync("SELECT * FROM products ORDER BY quantity ASC, lastSync DESC");
    } catch (error) {
      return [];
    }
  }

  // --- OFFLINE BUFFER & FORENSIC LOGGING ---

  async logEvent(event: string, actor: string, details: string, severity: "INFO" | "WARN" | "ERROR" | "CRITICAL") {
    if (Platform.OS === "web" || !this.db) return;
    try {
      const id = Crypto.randomUUID();
      await this.db.runAsync(
        "INSERT INTO forensic_audit (id, event, actor, details, severity) VALUES (?, ?, ?, ?, ?)",
        [id, event, actor, details, severity]
      );
    } catch (e) {
      console.warn("[FORENSIC] Log failure:", e);
    }
  }

  async bufferTransaction(type: string, payload: any) {
    if (Platform.OS === "web" || !this.db) return;
    try {
      const id = Crypto.randomUUID();
      await this.db.runAsync(
        "INSERT INTO offline_buffer (id, type, payload) VALUES (?, ?, ?)",
        [id, type, JSON.stringify(payload)]
      );
      await this.logEvent("TRANS_BUFFERED", "USER", `Buffered ${type} transaction`, "INFO");
      return id;
    } catch (e) {
      await this.logEvent("BUFFER_FAILURE", "SYSTEM", "Could not buffer transaction", "ERROR");
      throw e;
    }
  }

  async getPendingTransactions() {
    if (Platform.OS === "web" || !this.db) return [];
    return await this.db.getAllAsync("SELECT * FROM offline_buffer WHERE status = 'PENDING'");
  }

  async markAsSynced(id: string) {
    if (Platform.OS === "web" || !this.db) return;
    await this.db.runAsync("UPDATE offline_buffer SET status = 'SYNCED' WHERE id = ?", [id]);
  }

  async getAuditLogs(limit = 100) {
    if (Platform.OS === "web" || !this.db) return [];
    return await this.db.getAllAsync("SELECT * FROM forensic_audit ORDER BY timestamp DESC LIMIT ?", [limit]);
  }
}

export const sqliteService = new SqliteService();
