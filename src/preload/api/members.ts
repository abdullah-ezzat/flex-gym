import { ipcRenderer } from "electron";

export const membersAPI = {
  create: (data: any) => ipcRenderer.invoke("members:create", data),
  search: (query: string) => ipcRenderer.invoke("members:search", query),
};
