// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("FTWA", {
  openDialog: () => ipcRenderer.send("open-dialog"),
  setBackup: () => ipcRenderer.send("set-backup"),
  getData: () => ipcRenderer.invoke("get-data"),
  enableLauncher: () => ipcRenderer.send("enable-launcher"),
  toggleSync: () => ipcRenderer.invoke("toggle-sync"),
  updateConfig: (key, value) =>
    ipcRenderer.invoke("update-config", { key, value }),
});
