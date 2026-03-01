"use strict";
const electron = require("electron");
const path = require("node:path");
const node_url = require("node:url");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const QRCode = require("qrcode");
const fs = require("node:fs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
let db;
function initDatabase() {
  const dbPath = path.join(electron.app.getPath("userData"), "flex.db");
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
    (c) => c.name === "forcePasswordChange"
  );
  if (!hasForceFlag) {
    db.exec(`
      ALTER TABLE users
      ADD COLUMN forcePasswordChange INTEGER DEFAULT 0
    `);
  }
}
function getDB() {
  if (!db) throw new Error("DB not initialized");
  return db;
}
const SECRET = process.env.JWT_SECRET || "super-secure-secret";
async function login(username, password) {
  const db2 = getDB();
  const user = db2.prepare("SELECT * FROM users WHERE username=?").get(username);
  if (!user) throw new Error("User not found");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid password");
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      forcePasswordChange: !!user.forcePasswordChange
    },
    SECRET
  );
}
function verify(token) {
  return jwt.verify(token, SECRET);
}
async function updateAdminCredentials(userId, newUsername, newPassword) {
  const db2 = getDB();
  const hash = await bcrypt.hash(newPassword, 12);
  db2.prepare(
    `
    UPDATE users
    SET username = ?, password = ?, forcePasswordChange = 0
    WHERE id = ? AND role = 'admin'
  `
  ).run(newUsername, hash, userId);
}
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function getNextMemberCode(db2) {
  const row = db2.prepare("SELECT MAX(memberCode) as max FROM members").get();
  return (row?.max ?? 0) + 1;
}
function saveBase64Image(base64, id) {
  if (!base64) return "";
  const baseDir = electron.app.getPath("userData");
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
async function createMember(data) {
  const db2 = getDB();
  const id = uuid.v4();
  const memberCode = getNextMemberCode(db2);
  const baseDir = electron.app.getPath("userData");
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
      light: "#fff"
    }
  });
  const photoPath = saveBase64Image(data.photoPath, id);
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db2.prepare(
    `
    INSERT INTO members
    (id, memberCode, fullName, phone, email, address, plan, price,
     startDate, expiryDate, photoPath, qrCode, createdAt, deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `
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
    createdAt
  );
  return { id, memberCode };
}
function searchMembers(options) {
  const db2 = getDB();
  const { query = "", page = 1, limit = 20 } = options;
  let where = "deleted = 0";
  const params = [];
  if (query) {
    const like = `%${query}%`;
    if (!isNaN(Number(query))) {
      where += " AND (memberCode = ? OR fullName LIKE ? OR phone LIKE ? OR email LIKE ?)";
      params.push(Number(query), like, like, like);
    } else {
      where += " AND (fullName LIKE ? OR phone LIKE ? OR email LIKE ?)";
      params.push(like, like, like);
    }
  }
  const offset = (page - 1) * limit;
  const data = db2.prepare(
    `
      SELECT * FROM members
      WHERE ${where}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `
  ).all(...params, limit, offset);
  const totalRow = db2.prepare(`SELECT COUNT(*) as count FROM members WHERE ${where}`).get(...params);
  const total = Number(totalRow?.count ?? 0);
  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}
function getMemberByQR(qrString) {
  const db2 = getDB();
  if (qrString.startsWith("FLEX_MEMBER_CODE_")) {
    const code = Number(qrString.replace("FLEX_MEMBER_CODE_", ""));
    return db2.prepare("SELECT * FROM members WHERE memberCode=? AND deleted=0").get(code);
  }
  return null;
}
function getMemberById(id) {
  const db2 = getDB();
  return db2.prepare(
    `
        SELECT * FROM members
        WHERE id = ? AND deleted = 0
      `
  ).get(id);
}
function updateMember(id, data) {
  const db2 = getDB();
  let photoPath = data.photoPath;
  if (data.photoBase64) {
    photoPath = saveBase64Image(data.photoBase64, id);
  }
  db2.prepare(
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
  `
  ).run(
    data.fullName,
    data.phone,
    data.email,
    data.address,
    data.plan,
    data.price,
    data.expiryDate,
    photoPath,
    id
  );
  return { success: true };
}
function deleteMember(id) {
  const db2 = getDB();
  db2.prepare(
    `
    UPDATE members SET deleted=1 WHERE id=?
  `
  ).run(id);
  return { success: true };
}
function getRecentActivity() {
  const db2 = getDB();
  return db2.prepare(`
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
function getRevenueByMonth() {
  const db2 = getDB();
  return db2.prepare(
    `
      SELECT strftime('%m', startDate) as month,
             SUM(price) as revenue
      FROM members
      WHERE deleted=0
      GROUP BY month
      ORDER BY month
    `
  ).all();
}
function logAttendance(memberId) {
  const db2 = getDB();
  const member = db2.prepare("SELECT expiryDate FROM members WHERE id = ?").get(memberId);
  if (!member) {
    throw new Error("Member not found");
  }
  if (new Date(member.expiryDate) < /* @__PURE__ */ new Date()) {
    throw new Error("Membership expired");
  }
  const lastScan = db2.prepare(`
      SELECT scannedAt
      FROM attendance
      WHERE memberId = ?
      ORDER BY scannedAt DESC
      LIMIT 1
    `).get(memberId);
  if (lastScan) {
    const diff = Date.now() - new Date(lastScan.scannedAt).getTime();
    if (diff < 6e4) {
      return { success: false, reason: "Duplicate scan" };
    }
  }
  db2.prepare(`
      INSERT INTO attendance (id, memberId, scannedAt)
      VALUES (?, ?, ?)
  `).run(uuid.v4(), memberId, (/* @__PURE__ */ new Date()).toISOString());
  return { success: true };
}
function getMemberAttendanceStats(memberId) {
  const db2 = getDB();
  const total = db2.prepare(
    "SELECT COUNT(*) as count FROM attendance WHERE memberId = ?"
  ).get(memberId).count;
  const today = db2.prepare(
    "SELECT COUNT(*) as count FROM attendance WHERE memberId = ? AND date(scannedAt)=date('now')"
  ).get(memberId).count;
  const lastVisit = db2.prepare(
    `
      SELECT scannedAt
      FROM attendance
      WHERE memberId = ?
      ORDER BY scannedAt DESC
      LIMIT 1
    `
  ).get(memberId);
  const firstVisit = db2.prepare(
    `
      SELECT scannedAt
      FROM attendance
      WHERE memberId = ?
      ORDER BY scannedAt ASC
      LIMIT 1
    `
  ).get(memberId);
  const monthly = db2.prepare(
    `
        SELECT COUNT(*) as count
        FROM attendance
        WHERE memberId = ?
        AND strftime('%m', scannedAt)=strftime('%m','now')
      `
  ).get(memberId).count;
  return {
    totalVisits: total,
    visitsToday: today,
    visitsThisMonth: monthly,
    lastVisit: lastVisit?.scannedAt ?? null,
    firstVisit: firstVisit?.scannedAt ?? null
  };
}
function getWeeklyAttendance() {
  const db2 = getDB();
  return db2.prepare(`
    SELECT 
      date(scannedAt) as day,
      COUNT(*) as count
    FROM attendance
    WHERE date(scannedAt) >= date('now','localtime','-6 day')
    GROUP BY day
    ORDER BY day ASC
  `).all();
}
function getPeakHour() {
  const db2 = getDB();
  const result = db2.prepare(`
    SELECT 
      strftime('%H', scannedAt) as hour,
      COUNT(*) as count
    FROM attendance
    GROUP BY hour
    ORDER BY count DESC
    LIMIT 1
  `).get();
  if (!result) return null;
  return {
    hour: result.hour,
    count: result.count
  };
}
function getTopActiveMember() {
  const db2 = getDB();
  return db2.prepare(`
      SELECT 
        members.fullName,
        members.memberCode,
        COUNT(attendance.id) as visits
      FROM attendance
      JOIN members ON members.id = attendance.memberId
      GROUP BY attendance.memberId
      ORDER BY visits DESC
      LIMIT 1
    `).get();
}
function registerIPC() {
  electron.ipcMain.handle("auth:login", async (_, data) => {
    console.log("Login request received:", data);
    try {
      const result = await login(data.username, data.password);
      console.log("Login success");
      return result;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  });
  electron.ipcMain.handle("files:getImage", async (_, filePath) => {
    if (!fs__namespace.existsSync(filePath)) return null;
    const buffer = fs__namespace.readFileSync(filePath);
    const base64 = buffer.toString("base64");
    const ext = filePath.split(".").pop();
    return `data:image/${ext};base64,${base64}`;
  });
  electron.ipcMain.handle("auth:update-admin", async (_, data) => {
    try {
      const payload = verify(data.token);
      if (payload.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await updateAdminCredentials(
        payload.id,
        data.username,
        data.password
      );
      return { success: true };
    } catch (err) {
      console.error("Admin update failed:", err);
      throw err;
    }
  });
  electron.ipcMain.handle("members:create", (_, data) => createMember(data));
  electron.ipcMain.handle("members:getById", (_, id) => getMemberById(id));
  electron.ipcMain.handle(
    "members:update",
    (_, id, data) => updateMember(id, data)
  );
  electron.ipcMain.handle("members:delete", (_, id) => deleteMember(id));
  electron.ipcMain.handle(
    "members:search",
    (_, options) => searchMembers(options)
  );
  electron.ipcMain.handle("members:recent", () => getRecentActivity());
  electron.ipcMain.handle("dashboard:revenue", () => getRevenueByMonth());
  electron.ipcMain.handle(
    "dashboard:weekly-attendance",
    () => getWeeklyAttendance()
  );
  electron.ipcMain.handle("dashboard:peak-hour", () => getPeakHour());
  electron.ipcMain.handle("dashboard:top-member", () => getTopActiveMember());
  electron.ipcMain.handle(
    "dashboard:recent-activity",
    () => getRecentActivity()
  );
  electron.ipcMain.handle("members:qr", (_, qr) => getMemberByQR(qr));
  electron.ipcMain.handle("attendance:log", async (_, memberId) => {
    try {
      return logAttendance(memberId);
    } catch (err) {
      return { success: false, reason: err.message };
    }
  });
  electron.ipcMain.handle(
    "attendance:member-stats",
    (_, memberId) => getMemberAttendanceStats(memberId)
  );
  electron.ipcMain.handle("dashboard:stats", () => {
    const db2 = getDB();
    const totalMembers = db2.prepare("SELECT COUNT(*) as count FROM members").get().count;
    const activeToday = db2.prepare(
      `
      SELECT COUNT(*) as count
      FROM attendance
      WHERE date(scannedAt) = date('now','localtime')
    `
    ).get().count;
    const monthlyRevenue = db2.prepare(
      `
      SELECT SUM(price) as sum
      FROM members
      WHERE strftime('%Y-%m', startDate) =
            strftime('%Y-%m','now','localtime')
    `
    ).get().sum ?? 0;
    const expiringSoon = db2.prepare(
      `
      SELECT COUNT(*) as count
      FROM members
      WHERE expiryDate BETWEEN
            date('now','localtime')
            AND
            date('now','localtime','+7 day')
    `
    ).get().count;
    return {
      totalMembers,
      activeToday,
      monthlyRevenue,
      expiringSoon
    };
  });
}
function startExpiryWatcher() {
  setInterval(
    () => {
      const db2 = getDB();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      db2.prepare(
        `
      UPDATE members
      SET isActive = 0
      WHERE expiryDate < ?
    `
      ).run(now);
    },
    60 * 60 * 1e3
  );
}
async function initAdmin({ username, password }) {
  const db2 = getDB();
  const existing = db2.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
  if (existing) return;
  const hash = await bcrypt.hash(password, 12);
  db2.prepare(
    `
    INSERT INTO users (id, username, password, role, createdAt, forcePasswordChange)
    VALUES (?, ?, ?, 'admin', ?, 1)
  `
  ).run(uuid.v4(), username, hash, (/* @__PURE__ */ new Date()).toISOString());
}
const __filename$1 = node_url.fileURLToPath(require("url").pathToFileURL(__filename).href);
const __dirname$1 = path.dirname(__filename$1);
let mainWindow = null;
const isDev = !electron.app.isPackaged;
function createMainWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1e3,
    minHeight: 700,
    backgroundColor: "#0B0B0B",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      // Allow loading local resources
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname$1, "../preload/index.js")
    }
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = path.join(__dirname$1, "../renderer/index.html");
    mainWindow.loadFile(indexPath).catch(
      (err) => console.error("Failed to load production index.html:", err)
    );
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
} else {
  electron.app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
electron.app.whenReady().then(async () => {
  try {
    initDatabase();
    registerIPC();
    startExpiryWatcher();
    await initAdmin({ username: "admin", password: "admin123" });
    console.log("DB Path:", electron.app.getPath("userData"));
  } catch (err) {
    console.error("Startup error:", err);
  }
  createMainWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});
electron.session.defaultSession.setPermissionRequestHandler(
  (_webContents, permission, callback) => {
    if (permission === "media") {
      callback(true);
    } else {
      callback(false);
    }
  }
);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("web-contents-created", (_, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) {
      electron.shell.openExternal(url);
    }
    return { action: "deny" };
  });
  contents.on("will-navigate", (event, navigationUrl) => {
    const currentURL = contents.getURL();
    if (isDev) {
      if (!navigationUrl.startsWith("http://localhost:5173")) {
        event.preventDefault();
      }
      return;
    }
    try {
      const currentOrigin = new URL(currentURL).origin;
      const targetOrigin = new URL(navigationUrl).origin;
      if (currentOrigin !== targetOrigin) {
        console.warn("Blocked navigation to:", navigationUrl);
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });
});
