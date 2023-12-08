const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { join } = require("path");
const fs = require("fs");
const os = require("os");

function createAppWindow() {
  let win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1800,
    height: 900,
    title: "Libelula Studios",
    icon: join(__dirname, "../../assets/textures/icons/app/blueprint.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      /* devTools: false */
    },
    resizable: true,
  });

  win.loadFile("./index.html");
  return { win };
}

module.exports = createAppWindow;
