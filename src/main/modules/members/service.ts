import { v4 as uuid } from "uuid";
import QRCode from "qrcode";
import { getDB } from "../database/db";
import path from "node:path";
import fs from "node:fs";
import { app } from "electron";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getNextMemberCode(db: any): number {
  const row = db.prepare("SELECT MAX(memberCode) as max FROM members").get();
  return (row?.max ?? 0) + 1;
}

function saveBase64Image(base64: string, id: string) {
  if (!base64) return "";

  const baseDir = app.getPath("userData");
  const photoDir = path.join(baseDir, "photos");
  ensureDir(photoDir);

  const matches = base64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) return "";

  const ext = matches[1].split("/")[1];
  const buffer = Buffer.from(matches[2], "base64");
  const filePath = path.join(photoDir, `${id}.${ext}`);

  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function createMember(data: any) {
  const db = getDB();
  const id = uuid();
  const memberCode = getNextMemberCode(db);

  const baseDir = app.getPath("userData");
  const qrDir = path.join(baseDir, "qr");
  ensureDir(qrDir);

  const qrData = `FLEX_MEMBER_CODE_${memberCode}`;
  const qrPath = path.join(qrDir, `${memberCode}.png`);

  await QRCode.toFile(qrPath, qrData, {
    width: 600,
    margin: 4,
    errorCorrectionLevel: "H",
    color: {
      dark: "#000",
      light: "#fff",
    },
  });

  const photoPath = saveBase64Image(data.photoPath, id);
  const createdAt = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO members
    (id, memberCode, fullName, phone, email, address, plan, price,
     startDate, expiryDate, photoPath, qrCode, createdAt, deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `,
  ).run(
    id,
    memberCode,
    data.fullName,
    data.phone,
    data.email || "",
    data.address || "",
    data.plan,
    data.price,
    data.startDate,
    data.expiryDate,
    photoPath,
    qrPath,
    createdAt,
  );

  return { id, memberCode };
}

export function searchMembers(options: any) {
  const db = getDB();
  const { query = "", page = 1, limit = 20 } = options;

  let where = "deleted = 0";
  const params: any[] = [];

  if (query) {
    const like = `%${query}%`;

    if (!isNaN(Number(query))) {
      where +=
        " AND (memberCode = ? OR fullName LIKE ? OR phone LIKE ? OR email LIKE ?)";
      params.push(Number(query), like, like, like);
    } else {
      where += " AND (fullName LIKE ? OR phone LIKE ? OR email LIKE ?)";
      params.push(like, like, like);
    }
  }

  const offset = (page - 1) * limit;

  const data = db
    .prepare(
      `
      SELECT * FROM members
      WHERE ${where}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `,
    )
    .all(...params, limit, offset);

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM members WHERE ${where}`)
    .get(...params) as { count?: number } | undefined;
  const total = Number(totalRow?.count ?? 0);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export function getMemberByQR(qrString: string) {
  const db = getDB();

  if (qrString.startsWith("FLEX_MEMBER_CODE_")) {
    const code = Number(qrString.replace("FLEX_MEMBER_CODE_", ""));
    return db
      .prepare("SELECT * FROM members WHERE memberCode=? AND deleted=0")
      .get(code);
  }

  return null;
}

export function getMemberById(id: string) {
  const db = getDB();

  return db
    .prepare(
      `
        SELECT * FROM members
        WHERE id = ? AND deleted = 0
      `,
    )
    .get(id);
}

export function updateMember(id: string, data: any) {
  const db = getDB();

  let photoPath = data.photoPath;

  if (data.photoBase64) {
    photoPath = saveBase64Image(data.photoBase64, id);
  }

  db.prepare(
    `
    UPDATE members SET
      fullName=?,
      phone=?,
      email=?,
      address=?,
      plan=?,
      price=?,
      expiryDate=?,
      photoPath=?
    WHERE id=? AND deleted=0
  `,
  ).run(
    data.fullName,
    data.phone,
    data.email,
    data.address,
    data.plan,
    data.price,
    data.expiryDate,
    photoPath,
    id,
  );

  return { success: true };
}
export function deleteMember(id: string) {
  const db = getDB();

  db.prepare(
    `
    UPDATE members SET deleted=1 WHERE id=?
  `,
  ).run(id);

  return { success: true };
}

export function getRecentActivity() {
  const db = getDB();

  return db.prepare(`
    SELECT 
      a.id,
      a.scannedAt as time,
      m.fullName as name,
      m.memberCode
    FROM attendance a
    JOIN members m ON m.id = a.memberId
    ORDER BY a.scannedAt DESC
    LIMIT 30
  `).all();
}

export function getRevenueByMonth() {
  const db = getDB();

  return db
    .prepare(
      `
      SELECT strftime('%m', startDate) as month,
             SUM(price) as revenue
      FROM members
      WHERE deleted=0
      GROUP BY month
      ORDER BY month
    `,
    )
    .all();
}
