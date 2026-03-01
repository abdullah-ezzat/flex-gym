import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { getDB } from "../database/db";

const SECRET = process.env.JWT_SECRET || "super-secure-secret";

export async function createUser(
  username: string,
  password: string,
  role: string,
) {
  const db = getDB();
  const hash = await bcrypt.hash(password, 10);

  db.prepare(
    `
    INSERT INTO users (id, username, password, role, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `,
  ).run(uuid(), username, hash, role, new Date().toISOString());
}

export async function login(username: string, password: string) {
  const db = getDB();

  const user = db
    .prepare("SELECT * FROM users WHERE username=?")
    .get(username) as
    | {
        id: string;
        password: string;
        role: string;
        forcePasswordChange: number;
      }
    | undefined;

  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid password");

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      forcePasswordChange: !!user.forcePasswordChange,
    },
    SECRET,
  );
}

export function verify(token: string) {
  return jwt.verify(token, SECRET) as {
    id: string;
    role: string;
    forcePasswordChange: boolean;
  };
}

export async function updateAdminCredentials(
  userId: string,
  newUsername: string,
  newPassword: string,
) {
  const db = getDB();
  const hash = await bcrypt.hash(newPassword, 12);

  db.prepare(
    `
    UPDATE users
    SET username = ?, password = ?, forcePasswordChange = 0
    WHERE id = ? AND role = 'admin'
  `,
  ).run(newUsername, hash, userId);
}
