const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("jarvisApp", {
  changerAdresse: (adresse) => ipcRenderer.send("changer-adresse", adresse),
  recharger: () => ipcRenderer.send("recharger"),
});
