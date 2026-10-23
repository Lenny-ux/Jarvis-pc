# Jarvis — app Windows

Fenêtre Jarvis qui ouvre `https://192.168.1.96:3443` :
- accepte le certificat https "maison" du serveur Jarvis
- caméra + micro autorisés automatiquement (reconnaissance faciale, voix)
- l'écran ne se met pas en veille tant que Jarvis est ouvert
- reconnexion auto si le serveur ne répond pas

Raccourcis : **F11** plein écran · **F5** recharger · **F2** changer l'adresse · **F12** outils dev

## Construire le .exe
1. Envoie ce dossier dans un dépôt GitHub (branche `main`)
2. L'action « Construire le .exe Jarvis » se lance toute seule (~5 min)
3. Dans **Releases** : `Jarvis-installation.exe` (installe + raccourci bureau) ou `Jarvis-portable.exe` (se lance direct)
