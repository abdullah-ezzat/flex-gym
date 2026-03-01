import { ipcMain } from "electron";
import * as auth from "./auth/service";
import * as members from "./members/service";
import * as attendance from "./attendance/service";
import { getDB } from "./database/db";
import * as fs from "node:fs";

export function registerIPC() {
  ipcMain.handle("auth:login", async (_, data) => {
    console.log("Login request received:", data);

    try {
      const result = await auth.login(data.username, data.password);
      console.log("Login success");
      return result;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  });

  ipcMain.handle("files:getImage", async (_, filePath: string) => {
    if (!fs.existsSync(filePath)) return null;

    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString("base64");

    const ext = filePath.split(".").pop();

    return `data:image/${ext};base64,${base64}`;
  });

  ipcMain.handle("auth:update-admin", async (_, data) => {
    try {
      const payload = auth.verify(data.token);

      if (payload.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await auth.updateAdminCredentials(
        payload.id,
        data.username,
        data.password,
      );

      return { success: true };
    } catch (err) {
      console.error("Admin update failed:", err);
      throw err;
    }
  });

  ipcMain.handle("members:create", (_, data) => members.createMember(data));

  ipcMain.handle("members:getById", (_, id) => members.getMemberById(id));

  ipcMain.handle("members:update", (_, id, data) =>
    members.updateMember(id, data),
  );

  ipcMain.handle("members:delete", (_, id) => members.deleteMember(id));

  ipcMain.handle("members:search", (_, options) =>
    members.searchMembers(options),
  );

  ipcMain.handle("members:recent", () => members.getRecentActivity());

  ipcMain.handle("dashboard:revenue", () => members.getRevenueByMonth());

  ipcMain.handle("dashboard:weekly-attendance", () =>
    attendance.getWeeklyAttendance(),
  );

  ipcMain.handle("dashboard:peak-hour", () => attendance.getPeakHour());

  ipcMain.handle("dashboard:top-member", () => attendance.getTopActiveMember());

  ipcMain.handle("dashboard:recent-activity", () =>
    members.getRecentActivity(),
  );

  ipcMain.handle("members:qr", (_, qr) => members.getMemberByQR(qr));

  ipcMain.handle("attendance:log", async (_, memberId) => {
    try {
      return attendance.logAttendance(memberId);
    } catch (err: any) {
      return { success: false, reason: err.message };
    }
  });

  ipcMain.handle("attendance:member-stats", (_, memberId) =>
    attendance.getMemberAttendanceStats(memberId),
  );

  ipcMain.handle("dashboard:stats", () => {
    const db = getDB();

    const totalMembers = (
      db.prepare("SELECT COUNT(*) as count FROM members").get() as {
        count: number;
      }
    ).count;

    const activeToday = (
      db
        .prepare(
          `
      SELECT COUNT(*) as count
      FROM attendance
      WHERE date(scannedAt) = date('now','localtime')
    `,
        )
        .get() as { count: number }
    ).count;

    const monthlyRevenue =
      (
        db
          .prepare(
            `
      SELECT SUM(price) as sum
      FROM members
      WHERE strftime('%Y-%m', startDate) =
            strftime('%Y-%m','now','localtime')
    `,
          )
          .get() as { sum: number }
      ).sum ?? 0;

    const expiringSoon = (
      db
        .prepare(
          `
      SELECT COUNT(*) as count
      FROM members
      WHERE expiryDate BETWEEN
            date('now','localtime')
            AND
            date('now','localtime','+7 day')
    `,
        )
        .get() as { count: number }
    ).count;

    return {
      totalMembers,
      activeToday,
      monthlyRevenue,
      expiringSoon,
    };
  });
}
