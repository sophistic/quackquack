import { app, BrowserWindow, screen, ipcMain } from "electron";
import path from "path";

let mainWindow;

app.on("ready", () => {
  const display = screen.getPrimaryDisplay();
  const { width } = display.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 480,
    height: 100, // initial guess
    x: Math.floor((width - 400) / 2),
    y: 0,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // mainWindow.webContents.openDevTools();
});

// ✅ Listen for renderer to request resize
ipcMain.on("resize-window", (event, { width, height }) => {
  if (mainWindow) {
    mainWindow.setBounds({
      ...mainWindow.getBounds(),
      width,
      height,
    });
  }
});
