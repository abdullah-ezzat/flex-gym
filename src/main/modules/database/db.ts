import Database from "better-sqlite3";
import path from "node:path";
import { app } from "electron";

let db: Database.Database;

export function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "flex.db");

  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      createdAt TEXT,
      forcePasswordChange INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      memberCode INTEGER UNIQUE,
      fullName TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      plan TEXT,
      price REAL,
      startDate TEXT,
      expiryDate TEXT,
      photoPath TEXT,
      qrCode TEXT,
      createdAt TEXT,
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      memberId TEXT,
      scannedAt TEXT
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS members_fts
    USING fts5(fullName, phone, email, plan);
  `);

  runMigrations();
}

function runMigrations() {
  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  const hasForceFlag = userColumns.some(
    (c: any) => c.name === "forcePasswordChange",
  );

  if (!hasForceFlag) {
    db.exec(`
      ALTER TABLE users
      ADD COLUMN forcePasswordChange INTEGER DEFAULT 0
    `);
  }
}

export function getDB() {
  if (!db) throw new Error("DB not initialized");
  return db;
}
