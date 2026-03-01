import { contextBridge, ipcRenderer } from "electron";

const bridgeAPI = {
  auth: {
    login: (data: any) => ipcRenderer.invoke("auth:login", data),
    updateAdmin: (data: any) => ipcRenderer.invoke("auth:update-admin", data),
  },

  files: {
    getImage: (path: string) =>
      ipcRenderer.invoke("files:getImage", path),
  },

  members: {
    create: (data: any) =>
      ipcRenderer.invoke("members:create", data),

    getById: (id: string) =>
      ipcRenderer.invoke("members:getById", id),

    search: (options: any) =>
      ipcRenderer.invoke("members:search", options),

    byQR: (qr: string) =>
      ipcRenderer.invoke("members:qr", qr),

    update: (id: string, data: any) =>
      ipcRenderer.invoke("members:update", id, data),

    delete: (id: string) =>
      ipcRenderer.invoke("members:delete", id),
  },

  attendance: {
    log: (id: string) =>
      ipcRenderer.invoke("attendance:log", id),

    memberStats: (id: string) =>
      ipcRenderer.invoke("attendance:member-stats", id),
  },

  dashboard: {
    stats: () =>
      ipcRenderer.invoke("dashboard:stats"),

    weeklyAttendance: () =>
      ipcRenderer.invoke("dashboard:weekly-attendance"),

    revenue: () =>
      ipcRenderer.invoke("dashboard:revenue"),

    peakHour: () =>
      ipcRenderer.invoke("dashboard:peak-hour"),

    topMember: () =>
      ipcRenderer.invoke("dashboard:top-member"),

    recentActivity: () =>
      ipcRenderer.invoke("dashboard:recent-activity"),
  },
};

contextBridge.exposeInMainWorld("api", bridgeAPI);