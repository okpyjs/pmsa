const { app, BrowserWindow, ipcMain } = require("electron");
const { dialog } = require("electron");
const path = require("path");
const storage = require("electron-json-storage");
// const { exec } = require("child_process");
const { watch } = require("node:fs");
const fs = require("fs-extra");
const ftp = require("basic-ftp");
const AutoLaunch = require("auto-launch");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let watcher;

const send_files = async (source) => {
  const client = new ftp.Client();
  const ftp_host =
    Object.keys(storage.getSync("ftp_host")).length === 0
      ? ""
      : storage.getSync("ftp_host");
  const ftp_username =
    Object.keys(storage.getSync("ftp_username")).length === 0
      ? ""
      : storage.getSync("ftp_username");
  const ftp_password =
    Object.keys(storage.getSync("ftp_password")).length === 0
      ? ""
      : storage.getSync("ftp_password");
  const ftp_secure =
    Object.keys(storage.getSync("ftp_secure")).length === 0
      ? "false"
      : storage.getSync("ftp_secure");
  client.ftp.verbose = true;
  try {
    await client.access({
      host: ftp_host,
      user: ftp_username,
      password: ftp_password,
      secure: ftp_secure,
    });
    await client.uploadFromDir(source);
  } catch (err) {
    console.log(err);
  }
  client.close();
};

const startWatch = (source, backup) => {
  console.log("Started...");
  watcher = watch(source, async () => {
    await setTimeout(async () => {
      await send_files(source);
      await fs.copy(source, backup);
      await fs.emptyDir(source);
    }, 3000);
  });
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("enable-launcher", () => {
    const appLauncher = new AutoLaunch({
      name: "FTP Transfer Watcher launcher",
    });

    appLauncher.enable();
  });

  ipcMain.on("open-dialog", () => {
    const dir = dialog.showOpenDialog({ properties: ["openDirectory"] });
    dir.then((r) => storage.set("saved_path", r.filePaths[0]));
  });

  ipcMain.on("set-backup", () => {
    const dir = dialog.showOpenDialog({ properties: ["openDirectory"] });
    dir.then((r) => storage.set("backup", r.filePaths[0]));
  });

  ipcMain.handle("update-config", (e, { key, value }) => {
    storage.set(key, value);
  });

  ipcMain.handle("toggle-sync", () => {
    console.clear();
    if (watcher) {
      console.clear();
      console.log("Stoppo la sync");
      watcher.close();
      watcher = false;
      return;
    }
    const source =
      Object.keys(storage.getSync("saved_path")).length === 0
        ? ""
        : storage.getSync("saved_path");
    const backup =
      Object.keys(storage.getSync("backup")).length === 0
        ? ""
        : storage.getSync("backup");
    startWatch(source, backup);
  });

  ipcMain.handle("get-data", () => {
    const saved_path =
      Object.keys(storage.getSync("saved_path")).length === 0
        ? ""
        : storage.getSync("saved_path");
    const ftp_host =
      Object.keys(storage.getSync("ftp_host")).length === 0
        ? ""
        : storage.getSync("ftp_host");
    const ftp_username =
      Object.keys(storage.getSync("ftp_username")).length === 0
        ? ""
        : storage.getSync("ftp_username");
    const ftp_password =
      Object.keys(storage.getSync("ftp_password")).length === 0
        ? ""
        : storage.getSync("ftp_password");
    const backup =
      Object.keys(storage.getSync("backup")).length === 0
        ? ""
        : storage.getSync("backup");
    const ftp_secure =
      Object.keys(storage.getSync("ftp_secure")).length === 0
        ? "false"
        : storage.getSync("ftp_secure");
    return {
      saved_path,
      ftp_host,
      ftp_username,
      ftp_password,
      backup,
      ftp_secure,
    };
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
