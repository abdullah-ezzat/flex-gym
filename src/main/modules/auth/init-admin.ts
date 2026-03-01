import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { getDB } from "../database/db";

interface InitAdminOptions {
  username: string;
  password: string;
}

export async function initAdmin({ username, password }: InitAdminOptions) {
  const db = getDB();

  const existing = db
    .prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1")
    .get();

  if (existing) return;

  const hash = await bcrypt.hash(password, 12);

  db.prepare(
    `
    INSERT INTO users (id, username, password, role, createdAt, forcePasswordChange)
    VALUES (?, ?, ?, 'admin', ?, 1)
  `,
  ).run(uuid(), username, hash, new Date().toISOString());
}
