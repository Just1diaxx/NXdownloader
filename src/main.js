const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

function createWindow() {

    const splash = new BrowserWindow({
        width: 400,
        height: 300,
        resizable: false,
        frame: false,
        center: true,
        skipTaskbar: true,
        icon: path.join(__dirname, "logo.png"),
        transparent: true,
        alwaysOnTop: true
    });
    splash.loadFile(path.join(__dirname, "splash.html"));

    const win = new BrowserWindow({
        width: 900,
        height: 700,
        show: false,
        icon: path.join(__dirname, "logo.png"),
        webPreferences: {
            preload: path.join(__dirname, "renderer.js"),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.join(__dirname, "index.html"));

    win.once("ready-to-show", () => {
        setTimeout(() => {
            splash.close();
            win.removeMenu();
            win.maximize();
        }, 1500);
    });

    if (!app.isPackaged) win.webContents.openDevTools();

    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on("update-available", () => {
        win.webContents.send("update_available");
    });

    autoUpdater.on("update-downloaded", () => {
        win.webContents.send("update_downloaded");
    });
}
Menu.setApplicationMenu(null);

ipcMain.on("restart_app", () => {
    autoUpdater.quitAndInstall();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
