#!/usr/bin/env bash
# install.sh — Installation d'Angel's Launcher (Linux / macOS)
# Vérifie Node.js ≥ 22, installe les dépendances, crée une entrée de menu (Linux)
# et propose de générer un exécutable autonome (AppImage / dmg).
set -euo pipefail
cd "$(dirname "$0")"
DIR="$(pwd)"

echo "===== Installation d'Angel's Launcher ====="

# --- 1) Node.js ---
if ! command -v node >/dev/null 2>&1; then
  echo "[ERREUR] Node.js est introuvable. Installez Node.js 22.12+ (https://nodejs.org ou votre gestionnaire de paquets) puis relancez."
  exit 1
fi
MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$MAJOR" -lt 22 ]; then
  echo "[ERREUR] Node.js 22.12 ou supérieur requis (version détectée : $MAJOR)."; exit 1
fi
echo "[1/4] Node.js $(node -v) détecté."

# --- 2) Dépendances ---
echo "[2/4] Installation des dépendances (Electron ~100 Mo)…"
npm install --no-audit --no-fund
# Filet de sécurité : télécharge le binaire Electron si le script post-installation a été ignoré
[ -f node_modules/electron/path.txt ] || node node_modules/electron/install.js

# --- 3) Entrée de menu (Linux uniquement) ---
if [ "$(uname)" = "Linux" ]; then
  echo "[3/4] Création de l'entrée de menu…"
  mkdir -p "$HOME/.local/share/applications"
  cat > "$HOME/.local/share/applications/angels-launcher.desktop" <<DESK
[Desktop Entry]
Type=Application
Name=Angel's Launcher
Comment=Launcher de jeux local
Exec=$DIR/lancer.sh
Icon=$DIR/assets/icon.png
Terminal=false
Categories=Game;
DESK
else
  echo "[3/4] Raccourci : lancez ./lancer.sh (ou générez l'application .dmg ci-dessous)."
fi

chmod +x lancer.sh install.sh

# --- 4) Exécutable autonome (facultatif) ---
read -r -p "[4/4] Générer aussi un exécutable autonome dans dist/ ? [o/N] " rep
if [[ "$rep" =~ ^[oOyY]$ ]]; then
  CSC_IDENTITY_AUTO_DISCOVERY=false npm run dist && echo "Terminé : voir le dossier dist/"
fi

echo "===== Installation terminée — lancez ./lancer.sh ====="
