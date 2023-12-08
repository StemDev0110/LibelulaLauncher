const remoteMain = require("@electron/remote/main");
remoteMain.initialize();
const Client = require("minecraft-launcher-core");
const { app, ipcMain, BrowserWindow } = require("electron");
const { autoUpdater, AppUpdater } = require("electron-updater");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue } = require("firebase/database");
const {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
} = require("firebase/firestore");
const createAppWindow = require("../src/app/windows/app-process.js");
const fs = require("fs");
const path = require("path");
const os = require("os");
// Global exception handler
process.on("uncaughtException", function (err) {
  console.log(err);
});
const firebaseConfig = {
  apiKey: "AIzaSyBSeusJkawHaQ5INc9fN0tmKVcOss4-0c4",

  authDomain: "libelula-launcher.firebaseapp.com",

  databaseURL: "https://libelula-launcher-default-rtdb.firebaseio.com",

  projectId: "libelula-launcher",

  storageBucket: "libelula-launcher.appspot.com",

  messagingSenderId: "485415180208",

  appId: "1:485415180208:web:53399a0a4b432c2e12e875",

  measurementId: "G-HERLDRR6YL",
};

ipcMain.on("get-project-names", (event) => {
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getDatabase();
  const reference = ref(db, "Data/Versions/");

  onValue(
    reference,
    (snapshot) => {
      const data = snapshot.val(); // Obtener los datos en formato JSON
      const projectNames = Object.keys(data);
      event.reply("project-names", projectNames); // Enviar los nombres de proyectos al proceso de renderizado y tambien datos extra que se usaran en el manejo de versiones
      /* Verificar que esto realmente funcione osea el sistema que planteo */
    },
    {
      onlyOnce: true,
    },
  );
});
ipcMain.on("get-all-data", (event) => {
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getDatabase();
  const reference = ref(db, "Data/Versions/");

  onValue(
    reference,
    (snapshot) => {
      const data = snapshot.val(); // Obtener todos los datos en formato JSON
      event.reply("all-data", data); // Enviar todos los datos al proceso de renderizado en formato JSON
    },
    {
      onlyOnce: true,
    },
  );
});
app.whenReady().then(createAppWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
