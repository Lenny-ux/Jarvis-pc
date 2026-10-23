const { app, BrowserWindow, session, ipcMain, globalShortcut, powerSaveBlocker } = require("electron");
const path = require("path");
const fs = require("fs");

const ADRESSE_PAR_DEFAUT = "https://192.168.1.96:3443";
const fichierConfig = () => path.join(app.getPath("userData"), "config.json");

function lireAdresse() {
  try { return JSON.parse(fs.readFileSync(fichierConfig())).adresse || ADRESSE_PAR_DEFAUT; }
  catch { return ADRESSE_PAR_DEFAUT; }
}
function ecrireAdresse(adresse) {
  fs.writeFileSync(fichierConfig(), JSON.stringify({ adresse }));
}
const hoteJarvis = () => { try { return new URL(lireAdresse()).hostname; } catch { return ""; } };

let fenetre;

// Accepte le certificat https "maison" — uniquement pour le serveur Jarvis
app.on("certificate-error", (event, _wc, url, _err, _cert, callback) => {
  if (new URL(url).hostname === hoteJarvis()) { event.preventDefault(); callback(true); }
  else callback(false);
});

function charger() {
  fenetre.loadURL(lireAdresse()).catch(() => {});
}

function creerFenetre() {
  fenetre = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "build/icon.png"),
    title: "Jarvis",
    webPreferences: { preload: path.join(__dirname, "preload.js") },
  });
  fenetre.setMenu(null);

  // Si le serveur ne répond pas → page d'erreur avec relance auto
  fenetre.webContents.on("did-fail-load", (_e, code, desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return; // -3 = chargement annulé, pas une vraie erreur
    fenetre.loadFile(path.join(__dirname, "erreur.html"), { query: { adresse: lireAdresse(), erreur: desc } });
  });
  fenetre.webContents.on("render-process-gone", () => charger());

  // Raccourcis clavier quand la fenêtre est active
  fenetre.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11") { fenetre.setFullScreen(!fenetre.isFullScreen()); event.preventDefault(); }
    if (input.key === "F5") { charger(); event.preventDefault(); }
    if (input.key === "F2") {
      fenetre.loadFile(path.join(__dirname, "erreur.html"), { query: { adresse: lireAdresse(), erreur: "", reglage: "1" } });
      event.preventDefault();
    }
    if (input.key === "F12") { fenetre.webContents.toggleDevTools(); event.preventDefault(); }
    if (input.key === "Escape" && fenetre.isFullScreen()) { fenetre.setFullScreen(false); event.preventDefault(); }
  });

  charger();
}

app.whenReady().then(() => {
  // Caméra + micro autorisés automatiquement pour Jarvis
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    const autorisees = ["media", "notifications", "fullscreen", "clipboard-sanitized-write"];
    let hote = "";
    try { hote = new URL(wc.getURL()).hostname; } catch {}
    callback(autorisees.includes(permission) && hote === hoteJarvis());
  });
  session.defaultSession.setPermissionCheckHandler((wc, permission) => {
    let hote = "";
    try { hote = new URL(wc ? wc.getURL() : "").hostname; } catch {}
    return hote === hoteJarvis();
  });

  ipcMain.on("changer-adresse", (_e, adresse) => { if (adresse) ecrireAdresse(adresse); charger(); });
  ipcMain.on("recharger", () => charger());

  powerSaveBlocker.start("prevent-display-sleep"); // l'écran ne se met pas en veille tant que Jarvis est ouvert
  creerFenetre();
});

app.on("window-all-closed", () => app.quit());
