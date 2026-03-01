"use strict";
const electron = require("electron");
const bridgeAPI = {
  auth: {
    login: (data) => electron.ipcRenderer.invoke("auth:login", data),
    updateAdmin: (data) => electron.ipcRenderer.invoke("auth:update-admin", data)
  },
  files: {
    getImage: (path) => electron.ipcRenderer.invoke("files:getImage", path)
  },
  members: {
    create: (data) => electron.ipcRenderer.invoke("members:create", data),
    getById: (id) => electron.ipcRenderer.invoke("members:getById", id),
    search: (options) => electron.ipcRenderer.invoke("members:search", options),
    byQR: (qr) => electron.ipcRenderer.invoke("members:qr", qr),
    update: (id, data) => electron.ipcRenderer.invoke("members:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("members:delete", id)
  },
  attendance: {
    log: (id) => electron.ipcRenderer.invoke("attendance:log", id),
    memberStats: (id) => electron.ipcRenderer.invoke("attendance:member-stats", id)
  },
  dashboard: {
    stats: () => electron.ipcRenderer.invoke("dashboard:stats"),
    weeklyAttendance: () => electron.ipcRenderer.invoke("dashboard:weekly-attendance"),
    revenue: () => electron.ipcRenderer.invoke("dashboard:revenue"),
    peakHour: () => electron.ipcRenderer.invoke("dashboard:peak-hour"),
    topMember: () => electron.ipcRenderer.invoke("dashboard:top-member"),
    recentActivity: () => electron.ipcRenderer.invoke("dashboard:recent-activity")
  }
};
electron.contextBridge.exposeInMainWorld("api", bridgeAPI);
