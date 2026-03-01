import { app, BrowserWindow, session, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { initDatabase } from "./modules/database/db";
import { registerIPC } from "./modules/ipc";
import { startExpiryWatcher } from "./modules/system/expiry";
import { initAdmin } from "./modules/auth/init-admin";

// ------------------------------------------------------
// ESM __dirname replacement
// ------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------
// Globals
// ------------------------------------------------------
let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

// ------------------------------------------------------
// Create Main Window
// ------------------------------------------------------
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#0B0B0B",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false, // Allow loading local resources
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, "../preload/index.js"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = path.join(__dirname, "../renderer/index.html");
    mainWindow
      .loadFile(indexPath)
      .catch((err) =>
        console.error("Failed to load production index.html:", err),
      );
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ------------------------------------------------------
// Single Instance Lock
// ------------------------------------------------------
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ------------------------------------------------------
// App Ready
// ------------------------------------------------------
app.whenReady().then(async () => {
  try {
    initDatabase();
    registerIPC();
    startExpiryWatcher();
    await initAdmin({ username: "admin", password: "admin123" });

    console.log("DB Path:", app.getPath("userData"));
  } catch (err) {
    console.error("Startup error:", err);
  }

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// ------------------------------------------------------
// Permission Handling for Camera
// ------------------------------------------------------
session.defaultSession.setPermissionRequestHandler(
  (_webContents, permission, callback) => {
    if (permission === "media") {
      callback(true);
    } else {
      callback(false);
    }
  },
);

// ------------------------------------------------------
// Quit Behavior
// ------------------------------------------------------
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ------------------------------------------------------
// Secure Navigation Handling (Corrected)
// ------------------------------------------------------
app.on("web-contents-created", (_, contents) => {
  // Block popups but allow https links externally
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  contents.on("will-navigate", (event, navigationUrl) => {
    const currentURL = contents.getURL();

    // Allow dev server navigation
    if (isDev) {
      if (!navigationUrl.startsWith("http://localhost:5173")) {
        event.preventDefault();
      }
      return;
    }

    // Production: compare origins instead of checking file:// blindly
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
