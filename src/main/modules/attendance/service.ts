import { v4 as uuid } from "uuid";
import { getDB } from "../database/db";

export function logAttendance(memberId: string) {
  const db = getDB();

  const member = db
    .prepare("SELECT expiryDate FROM members WHERE id = ?")
    .get(memberId) as { expiryDate: string } | undefined;

  if (!member) {
    throw new Error("Member not found");
  }

  if (new Date(member.expiryDate) < new Date()) {
    throw new Error("Membership expired");
  }

  // Prevent duplicate scan within 60 seconds
  const lastScan = db
    .prepare(`
      SELECT scannedAt
      FROM attendance
      WHERE memberId = ?
      ORDER BY scannedAt DESC
      LIMIT 1
    `)
    .get(memberId) as { scannedAt: string } | undefined;

  if (lastScan) {
    const diff =
      Date.now() - new Date(lastScan.scannedAt).getTime();

    if (diff < 60_000) {
      return { success: false, reason: "Duplicate scan" };
    }
  }

  db.prepare(`
      INSERT INTO attendance (id, memberId, scannedAt)
      VALUES (?, ?, ?)
  `).run(uuid(), memberId, new Date().toISOString());

  return { success: true };
}

export function getMemberAttendanceStats(memberId: string) {
  const db = getDB();

  const total = (
    db
      .prepare(
        "SELECT COUNT(*) as count FROM attendance WHERE memberId = ?",
      )
      .get(memberId) as { count: number }
  ).count;

  const today = (
    db
      .prepare(
        "SELECT COUNT(*) as count FROM attendance WHERE memberId = ? AND date(scannedAt)=date('now')",
      )
      .get(memberId) as { count: number }
  ).count;

  const lastVisit = db
    .prepare(
      `
      SELECT scannedAt
      FROM attendance
      WHERE memberId = ?
      ORDER BY scannedAt DESC
      LIMIT 1
    `,
    )
    .get(memberId) as { scannedAt: string } | undefined;

  const firstVisit = db
    .prepare(
      `
      SELECT scannedAt
      FROM attendance
      WHERE memberId = ?
      ORDER BY scannedAt ASC
      LIMIT 1
    `,
    )
    .get(memberId) as { scannedAt: string } | undefined;

  const monthly = (
    db
      .prepare(
        `
        SELECT COUNT(*) as count
        FROM attendance
        WHERE memberId = ?
        AND strftime('%m', scannedAt)=strftime('%m','now')
      `,
      )
      .get(memberId) as { count: number }
  ).count;

  return {
    totalVisits: total,
    visitsToday: today,
    visitsThisMonth: monthly,
    lastVisit: lastVisit?.scannedAt ?? null,
    firstVisit: firstVisit?.scannedAt ?? null,
  };
}


export function getWeeklyAttendance() {
  const db = getDB();

  return db.prepare(`
    SELECT 
      date(scannedAt) as day,
      COUNT(*) as count
    FROM attendance
    WHERE date(scannedAt) >= date('now','localtime','-6 day')
    GROUP BY day
    ORDER BY day ASC
  `).all();
}

export function getPeakHour() {
  const db = getDB();

  const result = db.prepare(`
    SELECT 
      strftime('%H', scannedAt) as hour,
      COUNT(*) as count
    FROM attendance
    GROUP BY hour
    ORDER BY count DESC
    LIMIT 1
  `).get() as { hour: string; count: number } | undefined;

  if (!result) return null;

  return {
    hour: result.hour,
    count: result.count,
  };
}

export function getTopActiveMember() {
  const db = getDB();

  return db
    .prepare(`
      SELECT 
        members.fullName,
        members.memberCode,
        COUNT(attendance.id) as visits
      FROM attendance
      JOIN members ON members.id = attendance.memberId
      GROUP BY attendance.memberId
      ORDER BY visits DESC
      LIMIT 1
    `)
    .get();
}