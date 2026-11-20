# Angel's Launcher — code source complet

Chaque fichier texte est présenté avec son chemin puis son contenu intégral (icônes binaires et package-lock.json omis).

---

## `.gitignore`

````
node_modules/
dist/
*.log
````

---

## `README.md`

````markdown
# Angel's Launcher

Launcher de jeux de bureau **local** (fonctionne hors-ligne ; seule la recherche de pochettes utilise Internet, et elle est désactivable) : bibliothèque, lancement, suivi du temps de jeu,
dossiers surveillés, favoris, paramètres et sauvegardes. L'interface reproduit les maquettes fournies
(design system « Aether Launch » : thème sombre, accents cyan/violet, polices Space Grotesk / Manrope / JetBrains Mono).

## Fonctionnalités

| Fonction | Où |
|---|---|
| Lister les jeux (grille, tri, filtres Tous/Installés/Favoris, filtre par dossier) | Ma Bibliothèque |
| **Lancer** un jeu + comptage du temps de jeu et des sessions | Carte, héros, pages Favoris / Récents |
| **Ajouter** un jeu (exécutable + jaquette) ou surveiller un dossier (détection auto) | Bouton « Ajouter un jeu », « Ajouter un répertoire » |
| **Supprimer** un jeu de la bibliothèque (les fichiers du disque restent intacts) | Icône corbeille au survol d'une carte |
| **Rechercher** (insensible à la casse et aux accents) | Barre du haut, `Ctrl+F` |
| **Pochettes** : image locale au choix, ou **recherche automatique en ligne** (Steam) pour chaque jeu, avec choix manuel du bon résultat | Carte (survol) › icône image, bouton « Pochette » |
| Favoris, occupation des disques, journal des scans | Pages dédiées |
| Réglages (plein écran, scan auto, thème, manettes, sauvegardes) | Paramètres |

## Choix technologique : Electron + JavaScript natif (ES modules)

- **Electron** : seul moyen simple d'obtenir une vraie application de bureau multiplateforme (Windows/Linux/macOS)
  capable de **lancer des processus** (`child_process`), **lire les disques** (`fs.statfs`) et ouvrir l'explorateur de fichiers.
  Les maquettes étant déjà en HTML/CSS (Tailwind), leur fidélité est maximale en restant sur la pile web.
- **JavaScript natif sans framework ni bundler** : aucune étape de compilation, démarrage immédiat (`npm start`),
  très peu de dépendances à maintenir. L'interface est découpée en pages/composants (fonctions pures qui renvoient du HTML)
  et un store central ; React ou Vue n'apporteraient ici que de la complexité (une dizaine d'écrans, état simple).
- **Persistance JSON** : un fichier unique et lisible dans le dossier de données de l'utilisateur, écriture atomique.
  SQLite serait plus robuste pour des milliers de jeux, mais JSON suffit largement et n'exige aucun module natif.
- **Sécurité** : `contextIsolation`, pas de `nodeIntegration`, liste blanche des canaux IPC, CSP stricte,
  échappement systématique des données affichées.

## Démarrage rapide

**Windows** : double-cliquez sur `installer.bat`, puis lancez le raccourci « Angels Launcher » (ou `lancer.bat`).
**Linux / macOS** : `./install.sh` puis `./lancer.sh`.

Ou manuellement :

```bash
npm install
npm start
```

L'installation peut aussi produire un `.exe` autonome (`npm run dist`).

Voir [docs/INSTALLATION.md](docs/INSTALLATION.md), [docs/GUIDE_UTILISATEUR.md](docs/GUIDE_UTILISATEUR.md)
et [docs/STRUCTURE.md](docs/STRUCTURE.md).

## Pochettes : fonctionnement et confidentialité

- **Automatique** : à l'ajout d'un jeu, après un scan et au démarrage, les jeux sans pochette sont recherchés sur le magasin Steam
  (API publique, sans clé). Le nom du dossier est nettoyé (`BaldursGate3_v1.2` → « Baldurs Gate 3 »), le résultat le plus proche
  est retenu (les bandes-son/DLC sont écartés) et l'image verticale 600×900 est téléchargée (à défaut, l'image d'en-tête).
- **Manuel** : icône image au survol d'une carte ou bouton « Pochette » du héros → rechercher et **choisir le bon titre**,
  importer une **image locale**, relancer la recherche automatique ou **retirer** la pochette (plus aucune recherche automatique pour ce jeu).
- **Confidentialité** : seuls le nom du jeu et les requêtes d'image partent vers Steam. Réglage **Paramètres › Général › Recherche
  automatique des pochettes** pour tout désactiver. Hors-ligne, rien n'échoue : un jeu non résolu n'est retenté qu'après 7 jours.
- Les images sont stockées dans le dossier de données (`covers/`) et supprimées avec le jeu.

## Écarts assumés par rapport aux maquettes

Les éléments suivants des maquettes nécessitent des données qu'une application locale ne possède pas ; ils ont été
remplacés par des équivalents réellement fonctionnels :

- **Succès / trophées** (ex. « Légende de Dogtown ») → *statistiques locales* (temps total, favoris, jeu le plus joué).
- **Badges « Vérifié », « MAJ requise », FPS, version** → état réel : *Prêt* / *Introuvable* / *En cours*.
- **Transfert vers le NVMe, matériel détecté (CPU/GPU), profils d'optimisation** → non implémentés ;
  l'occupation réelle des disques est affichée et une alerte apparaît au-delà de 90 %.
- **Archive zip des sauvegardes** → copie JSON datée de la bibliothèque.
- **Polices** : si Space Grotesk / Manrope / JetBrains Mono sont installées sur la machine elles sont utilisées,
  sinon repli sur les polices système (voir la section « Polices » de l'installation).
- **Jaquettes** : recherchées en ligne ; en leur absence, générées automatiquement (dégradé + initiale).

## Licence

MIT
````

---

## `desinstaller.bat`

````bat
@echo off
REM desinstaller.bat - Supprime les raccourcis et les dependances installees (node_modules, dist).
REM Vos donnees (bibliotheque, reglages) dans %APPDATA%\angels-launcher sont CONSERVEES.
chcp 65001 >nul
cd /d "%~dp0"
choice /c ON /n /m "Supprimer raccourcis, node_modules et dist ? [O/N] "
if errorlevel 2 exit /b 0
powershell -NoProfile -Command "Remove-Item ([Environment]::GetFolderPath('Desktop')+'\Angels Launcher.lnk'),([Environment]::GetFolderPath('Programs')+'\Angels Launcher.lnk') -ErrorAction SilentlyContinue"
if exist node_modules rmdir /s /q node_modules
if exist dist rmdir /s /q dist
echo Termine. Pour effacer aussi vos donnees, supprimez le dossier %%APPDATA%%\angels-launcher
pause
````

---

## `install.sh`

````bash
#!/usr/bin/env bash
# install.sh — Installation d'Angel's Launcher (Linux / macOS)
# Vérifie Node.js ≥ 20, installe les dépendances, crée une entrée de menu (Linux)
# et propose de générer un exécutable autonome (AppImage / dmg).
set -euo pipefail
cd "$(dirname "$0")"
DIR="$(pwd)"

echo "===== Installation d'Angel's Launcher ====="

# --- 1) Node.js ---
if ! command -v node >/dev/null 2>&1; then
  echo "[ERREUR] Node.js est introuvable. Installez Node.js 20+ (https://nodejs.org ou votre gestionnaire de paquets) puis relancez."
  exit 1
fi
MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$MAJOR" -lt 20 ]; then
  echo "[ERREUR] Node.js 20 ou supérieur requis (version détectée : $MAJOR)."; exit 1
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
````

---

## `installer.bat`

````bat
@echo off
REM ============================================================
REM  installer.bat - Installation d'Angel's Launcher (Windows)
REM  1) verifie / installe Node.js  2) installe les dependances
REM  3) cree les raccourcis (Bureau + menu Demarrer)
REM  4) propose de generer un .exe autonome (installateur + portable)
REM ============================================================
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Installation - Angel's Launcher
echo.
echo  ===== Installation d'Angel's Launcher =====
echo.

REM --- 1) Node.js ---------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 set "PATH=%PATH%;%ProgramFiles%\nodejs"
where node >nul 2>nul
if errorlevel 1 (
  echo [1/4] Node.js est introuvable.
  where winget >nul 2>nul
  if errorlevel 1 (
    echo.
    echo  winget n'est pas disponible. Installez Node.js LTS depuis https://nodejs.org
    echo  puis relancez ce script.
    pause & exit /b 1
  )
  echo       Installation de Node.js LTS via winget ^(une validation administrateur peut apparaitre^)...
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  set "PATH=%PATH%;%ProgramFiles%\nodejs"
  where node >nul 2>nul
  if errorlevel 1 (
    echo.
    echo  Node.js vient d'etre installe : FERMEZ cette fenetre puis relancez installer.bat.
    pause & exit /b 0
  )
)
for /f %%v in ('node -p "process.versions.node.split('.')[0]"') do set "NODEMAJOR=%%v"
if %NODEMAJOR% LSS 20 (
  echo [ERREUR] Node.js 20 ou superieur est requis ^(version detectee : %NODEMAJOR%^).
  echo          Mettez a jour depuis https://nodejs.org puis relancez ce script.
  pause & exit /b 1
)
echo [1/4] Node.js %NODEMAJOR%.x detecte.

REM --- 2) Dependances -----------------------------------------------------
echo [2/4] Installation des dependances ^(telechargement d'Electron, ~100 Mo^)...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo [ERREUR] npm install a echoue. Verifiez votre connexion / proxy puis relancez.
  pause & exit /b 1
)
REM Filet de securite : telecharge le binaire Electron si le script post-installation a ete ignore
if not exist "node_modules\electron\dist\electron.exe" call node node_modules\electron\install.js
if not exist "node_modules\electron\dist\electron.exe" (
  echo [ERREUR] Electron n'a pas ete installe correctement.
  pause & exit /b 1
)

REM --- 3) Raccourcis ------------------------------------------------------
echo [3/4] Creation des raccourcis...
set "APPDIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d=$env:APPDIR.TrimEnd('\');" ^
  "$w=New-Object -ComObject WScript.Shell;" ^
  "foreach($dir in @([Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('Programs'))){" ^
  "  $s=$w.CreateShortcut($dir+'\Angels Launcher.lnk');" ^
  "  $s.TargetPath=$d+'\node_modules\electron\dist\electron.exe';" ^
  "  $s.Arguments='.'; $s.WorkingDirectory=$d;" ^
  "  $s.IconLocation=$d+'\assets\icon.ico'; $s.Description='Angel''s Launcher'; $s.Save() }"
if errorlevel 1 (echo       Raccourcis non crees ^(utilisez lancer.bat^).) else (echo       Raccourci "Angels Launcher" ajoute au Bureau et au menu Demarrer.)

REM --- 4) Executable autonome (facultatif) --------------------------------
echo.
echo [4/4] Generer aussi un .exe autonome ^(installateur + version portable^) dans le dossier dist\ ?
echo       ^(Compter 2 a 5 minutes. Si une erreur de liens symboliques apparait, activez le
echo        "Mode developpeur" de Windows ou relancez ce script en administrateur.^)
choice /c ON /n /m "      Generer le .exe maintenant ? [O/N] "
if errorlevel 2 goto fin
set "CSC_IDENTITY_AUTO_DISCOVERY=false"
call npm run dist
if errorlevel 1 (
  echo [AVERTISSEMENT] La generation du .exe a echoue ; l'application reste utilisable via le raccourci ou lancer.bat.
) else (
  echo       Termine : voir le dossier dist\ ^(installateur "Setup" et version "portable"^).
  start "" "%~dp0dist"
)

:fin
echo.
echo  ===== Installation terminee =====
echo  Lancez l'application avec le raccourci "Angels Launcher" ou en double-cliquant sur lancer.bat
echo.
pause
endlocal
````

---

## `lancer.bat`

````bat
@echo off
REM lancer.bat - Demarre Angel's Launcher (Windows) sans laisser de console ouverte.
setlocal
cd /d "%~dp0"
if not exist "node_modules\electron\dist\electron.exe" (
  echo Angel's Launcher n'est pas encore installe. Lancez d'abord installer.bat.
  pause & exit /b 1
)
start "" "node_modules\electron\dist\electron.exe" .
endlocal
````

---

## `lancer.sh`

````bash
#!/usr/bin/env bash
# lancer.sh — Démarre Angel's Launcher (Linux / macOS).
cd "$(dirname "$0")" || exit 1
if [ ! -d node_modules/electron ]; then
  echo "Angel's Launcher n'est pas installé. Lancez d'abord ./install.sh"; exit 1
fi
# --no-sandbox : nécessaire sur certaines distributions Linux sans sandbox SUID configurée
if [ "$(uname)" = "Linux" ]; then
  exec npx --no-install electron . --no-sandbox "$@"
else
  exec npx --no-install electron . "$@"
fi
````

---

## `package.json`

````json
{
  "name": "angels-launcher",
  "version": "1.1.0",
  "description": "Angel's Launcher — Launcher de jeux de bureau local (Electron)",
  "main": "main/main.js",
  "author": "Angel's Launcher",
  "license": "MIT",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "test": "node tests/smoke.test.js",
    "dist": "electron-builder --publish never",
    "pack:win": "electron-builder --win dir --x64 --publish never --config.win.signAndEditExecutable=false"
  },
  "devDependencies": {
    "electron": "^45.0.0",
    "electron-builder": "^25.1.8"
  },
  "build": {
    "appId": "com.angels.launcher",
    "productName": "Angel's Launcher",
    "files": [
      "main/**",
      "src/**",
      "assets/**",
      "package.json"
    ],
    "win": {
      "target": [
        "nsis",
        "portable"
      ],
      "icon": "assets/icon.ico"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    },
    "mac": {
      "target": "dmg"
    }
  }
}
````

---

## `assets/icon.svg`

````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8B5CF6"/><stop offset="1" stop-color="#06B6D4"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><path d="M18 48L32 16l14 32M24 38h16" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
````

---

## `docs/GUIDE_UTILISATEUR.md`

````markdown
# Guide d'utilisation

## Navigation
Barre latérale : **Ma Bibliothèque**, **Dossiers & Disques**, **Récemment ajoutés**, **Favoris**, **Paramètres**.

| Raccourci | Action |
|---|---|
| `Ctrl+F` | Aller à la recherche |
| `Ctrl+N` | Ajouter un jeu |
| `Ctrl+1` … `Ctrl+5` | Changer de page |
| `Échap` | Fermer une fenêtre |

## Ajouter des jeux
1. **Manuellement** : « Ajouter un jeu » → choisir l'exécutable (le nom est proposé automatiquement), éventuellement une jaquette.
2. **Par dossier** : page *Dossiers & Disques* → « Ajouter un répertoire ». Chaque sous-dossier contenant un exécutable
   devient un jeu (les désinstalleurs et utilitaires sont ignorés). Le dossier est re-scanné au démarrage et selon
   l'intervalle choisi dans les paramètres.
3. **Démo** : sur une bibliothèque vide, « Charger la démo » ajoute des jeux fictifs (non lançables) pour découvrir l'interface.

## Lancer un jeu
Survolez une carte et cliquez sur ▶, ou utilisez **JOUER** dans le héros. Le temps de jeu est compté tant que le
processus tourne (sauf si « Fermer le launcher lors du lancement » est activé).

## Rechercher, filtrer, trier
Saisissez dans la barre du haut (nom, sous-titre ou chemin). Dans *Ma Bibliothèque* : puces de dossier,
onglets Tous/Installés/Favoris et liste de tri.

## Supprimer
Icône 🗑 au survol d'une carte → confirmation. **Seule l'entrée de la bibliothèque est retirée**, jamais les fichiers.
Si le dossier est toujours surveillé, un nouveau scan peut ré-ajouter le jeu : utilisez « Délier » sur le dossier.

## Pochettes
- **Automatique** : les jeux sans pochette sont recherchés en ligne (Steam) à l'ajout, après un scan et au démarrage.
  Pendant la recherche, la carte pulse et affiche « Recherche… ». Un jeu introuvable est retenté après 7 jours.
- **Manuel** : survolez une carte et cliquez sur l'icône image (ou « Pochette » dans le héros). Vous pouvez :
  1. **Chercher** un autre titre et cliquer sur le bon résultat ;
  2. lancer la **recherche automatique** pour ce jeu ;
  3. choisir une **image locale** (png, jpg, webp, gif) ;
  4. **retirer** la pochette (le jeu n'est alors plus recherché automatiquement).
- **Tout d'un coup** : « Rechercher les pochettes manquantes » dans l'Accès rapide de la bibliothèque.
- **Désactiver** : Paramètres › Général › « Recherche automatique des pochettes » (puis Enregistrer).
  Seul le nom du jeu est envoyé à Steam ; aucune autre donnée.

## Favoris
Cliquez sur le cœur d'une carte. La page *Favoris* présente le coup de cœur, la grille et des statistiques.

## Paramètres
Modifiez puis cliquez **Enregistrer les modifications** (l'aperçu du thème est immédiat, l'enregistrement ne l'est pas).
**Restaurer par défaut** réinitialise tous les réglages. Onglet *Sauvegardes locales* : choisir un dossier puis
« Créer une sauvegarde ».
````

---

## `docs/INSTALLATION.md`

````markdown
# Installation

## Installation automatique (recommandée)

| Système | Installer | Lancer |
|---|---|---|
| **Windows** | double-clic sur `installer.bat` | raccourci **Angels Launcher** (Bureau / menu Démarrer) ou `lancer.bat` |
| **Linux / macOS** | `./install.sh` | `./lancer.sh` (Linux : aussi via le menu des applications) |

Le script vérifie Node.js 20+ (l'installe via `winget` sous Windows si absent), exécute `npm install`, crée les raccourcis,
puis propose de **générer un exécutable autonome** dans `dist/` :
- Windows : `Angel's Launcher Setup x.y.z.exe` (installateur) et `Angel's Launcher x.y.z.exe` (version portable, sans installation) ;
- Linux : un `.AppImage` ; macOS : un `.dmg` (à générer sur un Mac).

`desinstaller.bat` supprime les raccourcis et `node_modules` (vos données sont conservées).
Un exécutable se construit sur le système cible : le `.exe` Windows se génère donc depuis Windows.

## Distribuer l'application à d'autres utilisateurs (Windows)

Les utilisateurs finaux n'ont besoin ni de Node.js ni de droits administrateur.
1. `npm run pack:win` produit `dist/win-unpacked/` (l'application complète avec `Angel's Launcher.exe`).
2. Créez un dossier `Angels-Launcher-Setup/` contenant : `dist/win-unpacked` renommé en `app/`,
   puis les fichiers de `packaging/windows/` (`INSTALLER.bat`, `Install-AngelsLauncher.ps1`, `Uninstall.ps1`,
   `Desinstaller.bat`, `icon.ico`, `LISEZMOI.txt`).
3. Compressez ce dossier en zip et partagez-le : l'utilisateur extrait, double-clique sur `INSTALLER.bat`.

`INSTALLER.bat` installe dans `%LOCALAPPDATA%\Programs\AngelsLauncher`, crée les raccourcis (Bureau + menu Démarrer)
et inscrit l'application dans « Applications installées » ; `Desinstaller.bat` la retire proprement.
(Sur un PC Windows, `installer.bat` à la racine peut aussi produire un vrai `Setup.exe` via `npm run dist`.)

## Installation manuelle

## Prérequis
- **Node.js 20 ou supérieur** (avec npm) — https://nodejs.org
- Windows 10/11, Linux ou macOS

## Étapes
```bash
cd angels-launcher
npm install        # télécharge Electron (~100 Mo)
npm start          # lance l'application
npm run dev        # idem, avec les outils de développement ouverts
npm test           # tests des services principaux (sans interface)
```

## Créer un installateur
```bash
npm run dist       # electron-builder : .exe (NSIS), .AppImage ou .dmg dans dist/
```

## Où sont les données ?
Fichier `angels-data.json` dans le dossier utilisateur d'Electron :
- Windows : `%APPDATA%\angels-launcher\`
- Linux : `~/.config/angels-launcher/`
- macOS : `~/Library/Application Support/angels-launcher/`

Les jaquettes choisies sont copiées dans le sous-dossier `covers/`.

## Polices (facultatif)
Pour un rendu identique aux maquettes, installez **Space Grotesk**, **Manrope** et **JetBrains Mono** sur le système
(Google Fonts), ou placez les fichiers `.woff2` dans `src/assets/fonts/` et déclarez-les avec `@font-face` dans
`src/styles/theme.css`. L'application n'effectue aucune requête réseau.

## Dépannage
| Problème | Solution |
|---|---|
| `npm install` échoue au téléchargement d'Electron | Vérifier le proxy/pare-feu, relancer |
| Le jeu ne se lance pas | Vérifier le chemin de l'exécutable ; certains jeux exigent un lanceur (Steam, Epic) |
| Une manette n'apparaît pas | Appuyer sur un bouton de la manette, puis rouvrir l'onglet « Contrôleurs » |
````

---

## `docs/STRUCTURE.md`

````markdown
# Structure du projet

```
angels-launcher/
├── package.json              Scripts npm, dépendances, configuration electron-builder
├── README.md                 Présentation et choix technologique
├── installer.bat / lancer.bat / desinstaller.bat   Scripts Windows
├── install.sh / lancer.sh    Scripts Linux / macOS
├── packaging/windows/        Installateur pour utilisateurs finaux (INSTALLER.bat, scripts PowerShell, LISEZMOI)
├── main/                     ── Processus principal (Node.js / Electron)
│   ├── main.js               Fenêtre, instance unique, scan périodique, relance du dernier jeu
│   ├── preload.js            Pont sécurisé (liste blanche des canaux IPC)
│   ├── ipc.js                Tous les gestionnaires IPC (jeux, dossiers, réglages, sauvegardes, dialogues)
│   ├── library.js            Logique métier : ajout/suppression, scan, sessions, démo
│   └── services/
│       ├── storage.js        Persistance JSON atomique + réglages par défaut
│       ├── scanner.js        Détection des jeux dans un dossier
│       ├── covers.js         Pochettes : recherche Steam, appariement du nom, téléchargement, file d'attente
│       ├── disks.js          Occupation des disques
│       └── launcher.js       Lancement des jeux + suivi du temps
├── src/                      ── Interface (renderer)
│   ├── index.html            Coque : sidebar, topbar, zone de vue, modales
│   ├── styles/               theme.css (jetons) · layout.css (structure) · components.css
│   └── js/
│       ├── app.js            Rendu, délégation d'évènements, raccourcis
│       ├── actions.js        Actions (data-action) et changements de valeur
│       ├── store.js          État global (données + état d'affichage)
│       ├── components/       sidebar · gameCard · modal · toast
│       ├── pages/            library · folders · recent · favorites · settings
│       └── services/         api (IPC) · format · selectors · icons
├── assets/                   icon.svg · icon.png · icon.ico
├── docs/                     INSTALLATION.md · GUIDE_UTILISATEUR.md · STRUCTURE.md
└── tests/smoke.test.js       Test des services principaux
```

## Flux de données
1. L'interface appelle `api('games:add', …)` → `preload.js` → `ipc.js`.
2. Le gestionnaire modifie le `Storage` (via `library.js`) puis **diffuse l'état complet** (`state:changed`).
3. `store.js` reçoit l'état → `app.js` redessine la page courante.

Les pages sont des fonctions pures `(state, ui) → HTML` ; toute donnée utilisateur passe par `esc()`.

## Ajouter une page
1. Créer `src/js/pages/ma_page.js` exportant `renderMaPage(state, ui)`.
2. L'enregistrer dans `PAGES` (`app.js`) et dans la navigation (`components/sidebar.js`).
3. Ajouter les actions nécessaires dans `actions.js`.
````

---

## `main/ipc.js`

````javascript
/**
 * ipc.js — Enregistre tous les gestionnaires IPC (interface → processus principal).
 */
const { ipcMain, dialog, shell, app, net } = require('electron');
const fs = require('fs');
const path = require('path');
const lib = require('./library');
const { lancer } = require('./services/launcher');
const { listDisks } = require('./services/disks');
const covers = require('./services/covers');
const { DEFAULT_SETTINGS } = require('./services/storage');

function registerIpc(storage, getWin, onSettings = () => {}) {
  /** Pousse l'état à jour vers l'interface. */
  const diffuser = () => {
    const w = getWin();
    if (w && !w.isDestroyed()) w.webContents.send('state:changed', lib.getState(storage));
  };
  const toast = (message, type = 'info') => {
    const w = getWin();
    if (w && !w.isDestroyed()) w.webContents.send('toast', { message, type });
  };
  /** Enveloppe un gestionnaire : diffuse l'état après chaque modification. */
  const LECTURE = new Set(['state:get', 'disks:list', 'covers:search', 'dialog:exe', 'dialog:folder', 'dialog:image']); // sans effet sur l'état
  const h = (canal, fn) => ipcMain.handle(canal, async (_e, ...args) => {
    try { const r = await fn(...args); if (!LECTURE.has(canal)) diffuser(); return r; }
    catch (e) { return { ok: false, error: e.message }; }
  });
  const jeu = id => storage.data.games.find(g => g.id === id);

  // Service de pochettes : net.fetch utilise la pile réseau de Chromium (proxy système compris)
  covers.init({ storage, diffuser, toast, fetchImpl: (u, o) => net.fetch(u, o) });
  /** Lance la recherche des pochettes manquantes si l'option est activée. */
  const pochettesAuto = () => { if (storage.data.settings.autoCovers) covers.rechercherManquantes(); };

  h('state:get', () => lib.getState(storage));

  // ---------- Jeux ----------
  h('games:add', p => {
    const r = lib.addGame(storage, p);
    if (r.ok && !p.cover && storage.data.settings.autoCovers) covers.mettreEnFile([r.game.id]);
    return r;
  });
  h('games:remove', id => lib.removeGame(storage, id));
  h('games:update', (id, patch) => lib.updateGame(storage, id, patch));
  h('games:favorite', id => {
    const g = jeu(id); if (!g) return { ok: false };
    g.favorite = !g.favorite; storage.save(); return { ok: true, favorite: g.favorite };
  });
  h('games:openFolder', id => { const g = jeu(id); if (g) shell.showItemInFolder(g.exePath); return { ok: !!g }; });

  h('games:launch', id => {
    const g = jeu(id);
    if (!g) return { ok: false, error: 'Jeu introuvable.' };
    if (g.demo) return { ok: false, error: 'Jeu de démonstration : aucun exécutable réel à lancer.' };
    const r = lancer(g, (secondes, debut) => {
      lib.recordSession(storage, id, secondes, debut);
      diffuser();
      const w = getWin(); if (w && !w.isDestroyed()) toast(`${g.name} fermé — ${Math.round(secondes / 60)} min jouées`, 'success');
    });
    if (r.ok && storage.data.settings.closeOnLaunch) setTimeout(() => app.quit(), 1500);
    return r;
  });

  // ---------- Boîtes de dialogue ----------
  const filtreExe = process.platform === 'win32' ? [{ name: 'Exécutables', extensions: ['exe', 'bat', 'lnk'] }] : [];
  h('dialog:exe', async () => {
    const r = await dialog.showOpenDialog(getWin(), { properties: ['openFile'], filters: filtreExe });
    return r.canceled ? null : r.filePaths[0];
  });
  h('dialog:folder', async () => {
    const r = await dialog.showOpenDialog(getWin(), { properties: ['openDirectory', 'createDirectory'] });
    return r.canceled ? null : r.filePaths[0];
  });
  // Copie l'image choisie dans le dossier de données pour qu'elle survive à un déplacement du fichier d'origine
  h('dialog:image', async () => {
    const r = await dialog.showOpenDialog(getWin(), {
      properties: ['openFile'], filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }]
    });
    if (r.canceled) return null;
    const dossier = path.join(storage.dir, 'covers');
    fs.mkdirSync(dossier, { recursive: true });
    const dest = path.join(dossier, storage.newId('c') + path.extname(r.filePaths[0]));
    fs.copyFileSync(r.filePaths[0], dest);
    return dest;
  });

  // ---------- Dossiers surveillés ----------
  h('folders:add', p => {
    if (!p || !fs.existsSync(p)) return { ok: false, error: 'Dossier introuvable.' };
    if (storage.data.folders.some(f => f.path === p)) return { ok: false, error: 'Ce dossier est déjà surveillé.' };
    const f = { id: storage.newId('f'), name: path.basename(p) || p, path: p, autoSync: true, lastScan: null };
    storage.data.folders.push(f);
    const n = lib.scanOne(storage, f, 'initial');
    storage.save();
    pochettesAuto();
    return { ok: true, added: n };
  });
  h('folders:remove', id => {
    storage.data.folders = storage.data.folders.filter(f => f.id !== id);
    storage.save(); return { ok: true };
  });
  h('folders:scan', id => {
    const n = id ? lib.scanOne(storage, storage.data.folders.find(f => f.id === id) || { path: '' })
                 : lib.scanAll(storage);
    pochettesAuto();
    return { ok: true, added: n };
  });
  h('folders:open', id => {
    const f = storage.data.folders.find(x => x.id === id);
    if (f) shell.openPath(f.path);
    return { ok: !!f };
  });

  h('disks:list', () => listDisks());

  // ---------- Réglages ----------
  h('settings:save', patch => {
    storage.data.settings = { ...storage.data.settings, ...patch };
    storage.save(); onSettings(); return { ok: true };
  });
  h('settings:reset', () => {
    storage.data.settings = { ...DEFAULT_SETTINGS, lastBackup: storage.data.settings.lastBackup };
    storage.save(); onSettings(); return { ok: true };
  });

  // ---------- Sauvegardes locales ----------
  h('backup:create', () => {
    const dossier = storage.data.settings.backupDir;
    if (!dossier) return { ok: false, error: 'Définissez d\'abord le dossier de sauvegarde.' };
    storage.flush();
    fs.mkdirSync(dossier, { recursive: true });
    const nom = 'angels-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    const dest = path.join(dossier, nom);
    fs.copyFileSync(storage.file, dest);
    storage.data.settings.lastBackup = { date: Date.now(), path: dest, size: fs.statSync(dest).size };
    storage.save();
    return { ok: true, path: dest };
  });
  h('backup:open', () => {
    const d = storage.data.settings.backupDir;
    if (d && fs.existsSync(d)) shell.openPath(d);
    return { ok: !!d };
  });

  h('demo:load', () => { const n = lib.loadDemo(storage); pochettesAuto(); return { ok: true, added: n }; });

  // ---------- Pochettes ----------
  h('covers:search', (id, q) => covers.chercher(id, q));
  h('covers:apply', (id, appid, nom) => covers.appliquer(id, appid, nom));
  h('covers:auto', id => covers.auto(id));
  h('covers:setLocal', (id, p) => covers.definirLocal(id, p));
  h('covers:remove', id => covers.retirer(id));
  h('covers:fetchMissing', () => covers.rechercherManquantes({ force: true }));

  return { diffuser, toast };
}

module.exports = { registerIpc };
````

---

## `main/library.js`

````javascript
/**
 * library.js — Logique métier de la bibliothèque (ajout, suppression, scan, sessions).
 * Fonctions pures vis-à-vis d'Electron : elles ne touchent que l'objet Storage.
 */
const fs = require('fs');
const path = require('path');
const { scanFolder } = require('./services/scanner');
const { idsEnCours } = require('./services/launcher');
const covers = require('./services/covers');

/** État complet envoyé à l'interface (les jeux sont enrichis de `installed`). */
function getState(storage) {
  const d = storage.data;
  return {
    games: d.games.map(g => ({ ...g, installed: !!g.exePath && fs.existsSync(g.exePath) })),
    folders: d.folders,
    sessions: d.sessions.slice(0, 100),
    logs: d.logs,
    settings: d.settings,
    running: idsEnCours(),
    coverQueue: covers.enRecherche() // jeux dont la pochette est en cours de recherche
  };
}

/** Ajoute un jeu (refuse les doublons d'exécutable). */
function addGame(storage, p) {
  const name = String(p.name || '').trim();
  if (!name) return { ok: false, error: 'Le nom du jeu est obligatoire.' };
  if (!p.exePath) return { ok: false, error: 'Choisissez l\'exécutable du jeu.' };
  if (storage.data.games.some(g => g.exePath === p.exePath)) {
    return { ok: false, error: 'Ce jeu est déjà dans la bibliothèque.' };
  }
  const jeu = {
    id: storage.newId('g'), name, subtitle: String(p.subtitle || '').trim(),
    exePath: p.exePath, folder: p.folder || path.dirname(p.exePath),
    cover: p.cover || null, coverSource: p.cover ? 'manual' : null, coverCheckedAt: null,
    favorite: false, playtime: 0, lastPlayed: null,
    addedAt: Date.now(), sizeBytes: p.sizeBytes || 0, demo: !!p.demo
  };
  storage.data.games.push(jeu);
  storage.save();
  return { ok: true, game: jeu };
}

function removeGame(storage, id) {
  const cible = storage.data.games.find(g => g.id === id);
  if (cible) covers.supprimerFichier(storage.dir, cible.cover); // supprime aussi l'image téléchargée
  const avant = storage.data.games.length;
  storage.data.games = storage.data.games.filter(g => g.id !== id);
  storage.data.sessions = storage.data.sessions.filter(s => s.gameId !== id);
  storage.save();
  return { ok: storage.data.games.length < avant };
}

function updateGame(storage, id, patch) {
  const g = storage.data.games.find(x => x.id === id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  // Seuls ces champs sont modifiables depuis l'interface
  for (const k of ['name', 'subtitle', 'favorite']) if (k in patch) g[k] = patch[k];
  storage.save();
  return { ok: true };
}

/** Enregistre la fin d'une session de jeu. */
function recordSession(storage, id, secondes, debut) {
  const g = storage.data.games.find(x => x.id === id);
  if (!g) return;
  g.playtime += secondes;
  g.lastPlayed = Date.now();
  storage.data.sessions.unshift({ gameId: id, name: g.name, start: debut, end: Date.now(), seconds: secondes });
  storage.data.sessions = storage.data.sessions.slice(0, 200);
  storage.save();
}

/** Scanne un dossier surveillé et ajoute les nouveaux jeux. Retourne le nombre d'ajouts. */
function scanOne(storage, folder, declencheur = 'manuel') {
  if (!fs.existsSync(folder.path)) {
    storage.log('Dossier introuvable : ' + folder.path, 'error');
    return 0;
  }
  let ajoutes = 0;
  for (const j of scanFolder(folder.path)) {
    const r = addGame(storage, { ...j });
    if (r.ok) ajoutes++;
  }
  folder.lastScan = Date.now();
  storage.log(`Scan ${declencheur} de ${folder.path} : ${ajoutes} nouveau(x) jeu(x)`, ajoutes ? 'success' : 'info');
  storage.save();
  return ajoutes;
}

function scanAll(storage, declencheur = 'manuel') {
  return storage.data.folders.reduce((n, f) => n + scanOne(storage, f, declencheur), 0);
}

/** Jeux de démonstration (sans exécutable réel) pour tester l'interface. */
function loadDemo(storage) {
  const demo = [
    ['Cyberpunk 2077', 'Phantom Liberty', 142 * 3600, 68.4], ['Elden Ring', 'Shadow of the Erdtree', 188 * 3600, 49.2],
    ['Hades II', 'Early Access', 42 * 3600, 9.8], ['Starfield', '', 61 * 3600, 139.8],
    ['Baldur\'s Gate 3', 'Campagne Acte III', 94 * 3600, 122.4], ['Hollow Knight', '', 28 * 3600, 8.4]
  ];
  let n = 0;
  demo.forEach(([name, subtitle, playtime, go], i) => {
    const r = addGame(storage, { name, subtitle, exePath: `/demo/${name}.exe`, folder: '/demo', sizeBytes: go * 1e9, demo: true });
    if (r.ok) {
      Object.assign(r.game, { playtime, favorite: i < 3, lastPlayed: Date.now() - i * 86400000, addedAt: Date.now() - i * 3 * 86400000 });
      n++;
    }
  });
  storage.save();
  return n;
}

module.exports = { getState, addGame, removeGame, updateGame, recordSession, scanOne, scanAll, loadDemo };
````

---

## `main/main.js`

````javascript
/**
 * main.js — Point d'entrée Electron : fenêtre, instance unique, scan périodique.
 */
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { Storage } = require('./services/storage');
const covers = require('./services/covers');
const { registerIpc } = require('./ipc');
const lib = require('./library');
const { lancer } = require('./services/launcher');

let win = null;
let storage = null;
let timerScan = null;

function creerFenetre() {
  const s = storage.data.settings;
  win = new BrowserWindow({
    width: 1360, height: 860, minWidth: 980, minHeight: 640,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    backgroundColor: '#0D1117', title: "Angel's Launcher",
    fullscreen: !!s.fullscreen, // « Démarrer en plein écran / Big Picture »
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  if (process.argv.includes('--dev')) win.webContents.openDevTools({ mode: 'detach' });
  win.on('closed', () => { win = null; });
}

/** Programme le re-scan automatique selon le réglage « Intervalle de re-scan ». */
function programmerScan(api) {
  clearInterval(timerScan);
  const s = storage.data.settings;
  if (!s.autoDetectExe) return;
  if (s.rescanInterval === 'launch') return; // un seul scan, au démarrage (fait dans whenReady)
  const minutes = parseInt(s.rescanInterval, 10) || 30;
  timerScan = setInterval(() => {
    const n = lib.scanAll(storage, 'automatique');
    if (n) api.toast(`${n} nouveau(x) jeu(x) détecté(s)`, 'success');
    if (s.autoCovers) covers.rechercherManquantes();
    api.diffuser();
  }, minutes * 60 * 1000);
}

// Une seule instance de l'application à la fois
if (!app.requestSingleInstanceLock()) app.quit();
else app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  storage = new Storage(app.getPath('userData'));
  storage.load();
  let api = null;
  // Reprogramme le scan automatique dès que les réglages sont enregistrés
  api = registerIpc(storage, () => win, () => programmerScan(api));
  creerFenetre();

  // Scan au démarrage + reprogrammation à chaque changement de réglages
  if (storage.data.settings.autoDetectExe) lib.scanAll(storage, 'au démarrage');
  programmerScan(api);
  // Pochettes manquantes : recherche en arrière-plan peu après le démarrage
  if (storage.data.settings.autoCovers) setTimeout(() => covers.rechercherManquantes(), 3000);

  // Option « Lancer automatiquement le dernier jeu joué »
  if (storage.data.settings.autoLaunchLast) {
    const dernier = [...storage.data.games].filter(g => g.lastPlayed && !g.demo).sort((a, b) => b.lastPlayed - a.lastPlayed)[0];
    if (dernier) lancer(dernier, (sec, debut) => { lib.recordSession(storage, dernier.id, sec, debut); api.diffuser(); });
  }

  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) creerFenetre(); });
});

app.on('before-quit', () => { if (storage) storage.flush(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
````

---

## `main/preload.js`

````javascript
/**
 * preload.js — Pont sécurisé entre l'interface (renderer) et le processus principal.
 * Seuls les canaux de la liste blanche sont accessibles (contextIsolation activé).
 */
const { contextBridge, ipcRenderer } = require('electron');

const CANAUX = [
  'state:get', 'games:add', 'games:remove', 'games:update', 'games:favorite', 'games:launch',
  'games:openFolder', 'dialog:exe', 'dialog:folder', 'dialog:image',
  'folders:add', 'folders:remove', 'folders:scan', 'folders:open',
  'covers:search', 'covers:apply', 'covers:auto', 'covers:setLocal', 'covers:remove', 'covers:fetchMissing',
  'disks:list', 'settings:save', 'settings:reset', 'backup:create', 'backup:open', 'demo:load'
];

contextBridge.exposeInMainWorld('angels', {
  /** Appelle une action du processus principal et renvoie sa réponse. */
  invoke: (canal, ...args) => {
    if (!CANAUX.includes(canal)) return Promise.reject(new Error('Canal non autorisé : ' + canal));
    return ipcRenderer.invoke(canal, ...args);
  },
  /** Écoute les évènements poussés par le processus principal (ex. 'state:changed'). */
  on: (canal, cb) => {
    if (!['state:changed', 'toast'].includes(canal)) return;
    ipcRenderer.on(canal, (_e, donnees) => cb(donnees));
  }
});
````

---

## `main/services/covers.js`

````javascript
/**
 * covers.js — Gestion des pochettes : recherche en ligne (Steam), téléchargement, choix manuel, file d'attente.
 *
 * Source : API publique du magasin Steam (aucune clé requise). Seul le NOM du jeu est envoyé.
 * Le module n'utilise pas Electron directement : le « fetch » est injecté (net.fetch en production,
 * un faux fetch dans les tests), ce qui le rend testable avec Node seul.
 */
const fs = require('fs');
const path = require('path');

/** Hôtes d'images Steam essayés tour à tour (les URL ont changé au fil du temps). */
const HOTES = [
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps',
  'https://cdn.akamai.steamstatic.com/steam/apps',
  'https://cdn.cloudflare.steamstatic.com/steam/apps'
];
/** Pochette verticale 600×900 d'abord ; à défaut, l'image d'en-tête (horizontale, rognée par la carte). */
const FICHIERS = ['library_600x900.jpg', 'header.jpg'];
const REESSAI_MS = 7 * 86400000; // un jeu introuvable n'est re-cherché automatiquement qu'après 7 jours

let ctx = null;          // { storage, diffuser, toast, fetchImpl }
const attente = [];      // ids de jeux en attente de recherche
let courant = null;      // id en cours de traitement
let actif = false;
let dernierAvertissement = 0; // évite d'afficher plusieurs fois « connexion indisponible »

/** Initialise le service avec ses dépendances. */
function init(c) { ctx = { fetchImpl: (...a) => fetch(...a), diffuser() {}, toast() {}, ...c }; }

// ======================= Nom → terme de recherche =======================

/** Normalise un titre pour la comparaison (minuscules, sans accents, sans apostrophes ni symboles). */
function normaliserTitre(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '').replace(/[™®©]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
}
const MOTS_VIDES = new Set(['the', 'a', 'an', 'of', 'edition', 'complete', 'definitive', 'ultimate', 'goty', 'deluxe', 'remastered', 'digital', 'standard', 'game', 'year']);
const jetons = s => normaliserTitre(s).split(' ').filter(t => t && !MOTS_VIDES.has(t));

/** Nettoie un nom de dossier/jeu : « BaldursGate3_v1.2.0 » → « Baldurs Gate 3 ». */
function nettoyerNom(nom) {
  let s = String(nom || '').trim().replace(/\(.*?\)|\[.*?\]/g, ' ');
  const colle = !/\s/.test(s); // nom de type dossier (sans espaces) : on le « décolle »
  if (colle) s = s.replace(/_+/g, ' ');
  s = s.replace(/\bv?\d+(\.\d+){1,}\b/gi, ' '); // numéros de version
  if (colle) s = s.replace(/[._-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Za-z])(\d)/g, '$1 $2');
  return s.replace(/\s+/g, ' ').trim();
}

/** Similarité 0..1 entre deux titres. */
function similarite(a, b) {
  const na = normaliserTitre(a), nb = normaliserTitre(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const A = new Set(jetons(a)), B = new Set(jetons(b));
  if (!A.size || !B.size) return 0;
  const commun = [...A].filter(x => B.has(x)).length;
  const jaccard = commun / (A.size + B.size - commun);
  return (na.startsWith(nb) || nb.startsWith(na)) ? Math.max(jaccard, 0.85) : jaccard;
}

const PARASITES = /soundtrack|artbook|season pass|dlc|demo|beta|playtest|expansion/i;

/** Meilleur résultat pour un nom de jeu, ou null si rien d'assez proche (seuil 0,6). */
function meilleureCorrespondance(nom, resultats) {
  let best = null;
  for (const r of resultats) {
    let score = similarite(nom, r.name);
    if (PARASITES.test(r.name) && !PARASITES.test(nom)) score -= 0.25; // bande-son, DLC, démo…
    if (!best || score > best.score + 1e-9) best = { ...r, score };
  }
  return best && best.score >= 0.6 ? best : null;
}

// ======================= Réseau =======================

async function requete(url, ms = 10000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { return await ctx.fetchImpl(url, { signal: ac.signal, headers: { 'User-Agent': "AngelsLauncher/1.0" } }); }
  finally { clearTimeout(t); }
}

const erreurReseau = msg => Object.assign(new Error(msg), { reseau: true });

/** Recherche dans le magasin Steam (10 résultats maximum). */
async function rechercherSteam(terme) {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(terme)}&l=french&cc=FR`;
  let res;
  try { res = await requete(url); } catch { throw erreurReseau('Connexion impossible (réseau indisponible ?)'); }
  if (!res.ok) throw Object.assign(new Error('Steam a répondu ' + res.status), { reseau: res.status >= 500 || res.status === 429 });
  const j = await res.json();
  return (j.items || []).filter(i => !i.type || i.type === 'app').map(i => ({ appid: i.id, name: i.name }));
}

/** Télécharge une image ; renvoie {buffer, ext} ou null (jette si le réseau est injoignable). */
async function telecharger(url) {
  const r = await requete(url);
  if (!r.ok) return null;
  const type = (r.headers.get('content-type') || '').toLowerCase();
  if (!type.startsWith('image/')) return null;
  const buffer = Buffer.from(await r.arrayBuffer());
  return buffer.length > 2000 ? { buffer, ext: type.includes('png') ? '.png' : '.jpg' } : null;
}

/** Cherche la meilleure image disponible pour un appid. */
async function telechargerPochette(appid) {
  let echecs = 0, essais = 0;
  for (const f of FICHIERS) {
    for (const h of HOTES) {
      essais++;
      try { const img = await telecharger(`${h}/${appid}/${f}`); if (img) return img; }
      catch { echecs++; }
    }
  }
  // Dernier recours : l'API appdetails donne l'URL exacte de l'image d'en-tête
  try {
    const r = await requete(`https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic`);
    if (r.ok) {
      const url = (await r.json())?.[appid]?.data?.header_image;
      if (url) { const img = await telecharger(url); if (img) return img; }
    }
  } catch { echecs++; }
  if (echecs >= essais) throw erreurReseau('Connexion impossible (réseau indisponible ?)');
  return null;
}

// ======================= Fichiers =======================

const dossierCovers = () => path.join(ctx.storage.dir, 'covers');

/** Supprime un fichier de pochette, uniquement s'il se trouve dans le dossier « covers » de l'application. */
function supprimerFichier(dirDonnees, chemin) {
  if (!chemin) return;
  const base = path.resolve(dirDonnees, 'covers') + path.sep;
  const cible = path.resolve(chemin);
  if (cible.startsWith(base)) { try { fs.unlinkSync(cible); } catch { /* déjà supprimé */ } }
}

const trouver = id => ctx.storage.data.games.find(g => g.id === id);

// ======================= Actions publiques =======================

/** Liste les résultats Steam pour un jeu (ou pour un terme saisi à la main). */
async function chercher(id, terme) {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  const q = (terme && terme.trim()) || nettoyerNom(g.name);
  return { ok: true, query: q, results: await rechercherSteam(q) };
}

/** Télécharge et applique la pochette d'un appid Steam choisi. */
async function appliquer(id, appid, nomSteam = '') {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  const img = await telechargerPochette(appid);
  if (!img) {
    g.coverCheckedAt = Date.now(); ctx.storage.save();
    return { ok: false, error: 'Aucune image disponible pour ce titre.' };
  }
  fs.mkdirSync(dossierCovers(), { recursive: true });
  const dest = path.join(dossierCovers(), `${g.id}-${Date.now()}${img.ext}`); // nom unique : évite le cache d'image
  fs.writeFileSync(dest, img.buffer);
  supprimerFichier(ctx.storage.dir, g.cover);
  Object.assign(g, { cover: dest, coverSource: 'steam', coverCheckedAt: Date.now(), coverTitle: nomSteam || null });
  ctx.storage.save();
  return { ok: true, name: nomSteam };
}

/** Recherche automatique : meilleure correspondance du nom, puis téléchargement. */
async function auto(id) {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  const propre = nettoyerNom(g.name);
  let resultats = await rechercherSteam(propre);
  if (!resultats.length && propre !== g.name) resultats = await rechercherSteam(g.name);
  const choix = meilleureCorrespondance(propre, resultats);
  if (!choix) {
    g.coverCheckedAt = Date.now(); ctx.storage.save(); // évite de re-chercher à chaque démarrage
    return { ok: false, error: 'Aucune pochette trouvée pour « ' + g.name + ' ».' };
  }
  return appliquer(id, choix.appid, choix.name);
}

/** Pochette choisie depuis un fichier local (déjà copié dans « covers » par la boîte de dialogue). */
function definirLocal(id, chemin) {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  if (g.cover !== chemin) supprimerFichier(ctx.storage.dir, g.cover);
  Object.assign(g, { cover: chemin, coverSource: 'manual', coverTitle: null });
  ctx.storage.save();
  return { ok: true };
}

/** Retire la pochette et empêche toute recherche automatique ultérieure pour ce jeu. */
function retirer(id) {
  const g = trouver(id);
  if (!g) return { ok: false, error: 'Jeu introuvable.' };
  supprimerFichier(ctx.storage.dir, g.cover);
  Object.assign(g, { cover: null, coverSource: 'none', coverTitle: null });
  ctx.storage.save();
  return { ok: true };
}

// ======================= File d'attente =======================

/** Un jeu est éligible à la recherche automatique s'il n'a pas de pochette et n'a pas été refusé/choisi à la main. */
const eligible = (g, force) => !g.cover && g.coverSource !== 'none' && g.coverSource !== 'manual'
  && (force || !g.coverCheckedAt || Date.now() - g.coverCheckedAt > REESSAI_MS);

/** Ids actuellement en cours de recherche (pour l'indicateur visuel). */
const enRecherche = () => (courant ? [courant, ...attente] : [...attente]);

const pause = ms => new Promise(r => setTimeout(r, ms));

async function traiter() {
  if (actif) return;
  actif = true;
  let trouvees = 0, total = 0, horsLigne = false;
  while (attente.length) {
    courant = attente.shift(); total++;
    ctx.diffuser();
    try { if ((await auto(courant)).ok) trouvees++; }
    catch (e) { if (e.reseau) { horsLigne = true; attente.length = 0; } } // hors-ligne : inutile d'insister
    courant = null;
    ctx.diffuser();
    if (attente.length) await pause(300); // on ménage le serveur
  }
  actif = false;
  if (horsLigne) {
    if (Date.now() - dernierAvertissement > 5 * 60 * 1000) { dernierAvertissement = Date.now(); ctx.toast('Recherche de pochettes impossible : connexion indisponible.', 'error'); }
  }
  else if (total) ctx.toast(`${trouvees} pochette(s) trouvée(s) sur ${total} jeu(x).`, trouvees ? 'success' : 'info');
}

function mettreEnFile(ids) {
  for (const id of ids) if (id !== courant && !attente.includes(id)) attente.push(id);
  traiter();
}

/** Met en file tous les jeux sans pochette. `force` ignore le délai de nouvel essai. Renvoie le nombre de jeux. */
function rechercherManquantes({ force = false } = {}) {
  const ids = ctx.storage.data.games.filter(g => eligible(g, force)).map(g => g.id);
  mettreEnFile(ids);
  return { ok: true, queued: ids.length };
}

module.exports = {
  init, chercher, appliquer, auto, definirLocal, retirer, mettreEnFile, rechercherManquantes,
  enRecherche, supprimerFichier, nettoyerNom, normaliserTitre, similarite, meilleureCorrespondance
};
````

---

## `main/services/disks.js`

````javascript
/**
 * disks.js — Liste des disques/volumes et de leur occupation (via fs.statfsSync).
 */
const fs = require('fs');
const os = require('os');

/** Renvoie l'occupation d'un point de montage, ou null s'il est inaccessible. */
function infoVolume(mount) {
  try {
    const s = fs.statfsSync(mount);
    const total = s.blocks * s.bsize;
    const free = s.bavail * s.bsize;
    return { mount, total, free, used: total - free };
  } catch { return null; }
}

function listDisks() {
  let points = [];
  if (process.platform === 'win32') {
    for (let c = 65; c <= 90; c++) points.push(String.fromCharCode(c) + ':\\');
  } else {
    points = ['/', os.homedir()];
    for (const base of ['/mnt', '/media', '/Volumes', '/run/media']) {
      try { for (const e of fs.readdirSync(base)) points.push(base + '/' + e); } catch { /* absent */ }
    }
  }
  const vus = new Set();
  const disques = [];
  for (const m of points) {
    if (process.platform === 'win32' && !fs.existsSync(m)) continue;
    const v = infoVolume(m);
    if (!v || !v.total) continue;
    // Évite les doublons : même capacité + même espace libre = même volume
    const cle = v.total + ':' + v.free;
    if (vus.has(cle)) continue;
    vus.add(cle);
    disques.push({ id: m, label: process.platform === 'win32' ? 'Lecteur ' + m.slice(0, 2) : m, ...v });
  }
  return disques;
}

module.exports = { listDisks, infoVolume };
````

---

## `main/services/launcher.js`

````javascript
/**
 * launcher.js — Lancement d'un jeu et suivi de la session (durée de jeu).
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const enCours = new Map(); // gameId -> { pid, start }

/**
 * Lance l'exécutable d'un jeu.
 * @param {object} jeu     jeu de la bibliothèque
 * @param {function} onFin rappel (durée en secondes, début en ms) appelé à la fermeture du jeu
 */
function lancer(jeu, onFin) {
  if (!jeu.exePath || !fs.existsSync(jeu.exePath)) {
    return { ok: false, error: 'Exécutable introuvable : ' + jeu.exePath };
  }
  if (enCours.has(jeu.id)) return { ok: false, error: 'Ce jeu est déjà en cours d\'exécution.' };
  try {
    const enfant = spawn(jeu.exePath, jeu.args || [], {
      cwd: path.dirname(jeu.exePath), detached: true, stdio: 'ignore'
    });
    const debut = Date.now();
    enCours.set(jeu.id, { pid: enfant.pid, start: debut });
    enfant.on('error', () => { enCours.delete(jeu.id); onFin(0, debut); });
    enfant.on('exit', () => {
      enCours.delete(jeu.id);
      onFin(Math.round((Date.now() - debut) / 1000), debut);
    });
    enfant.unref(); // le jeu continue même si le launcher se ferme
    return { ok: true, pid: enfant.pid, start: debut };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const idsEnCours = () => [...enCours.keys()];

module.exports = { lancer, idsEnCours };
````

---

## `main/services/scanner.js`

````javascript
/**
 * scanner.js — Détection des jeux dans un répertoire.
 * Règle : chaque sous-dossier direct est considéré comme un jeu ; on y cherche
 * l'exécutable le plus volumineux (profondeur max. 3) en ignorant désinstalleurs et utilitaires.
 */
const fs = require('fs');
const path = require('path');

const EXT_EXEC = process.platform === 'win32' ? /\.exe$/i : /\.(appimage|sh|x86_64|x86)$/i;
const IGNORES = /(unins|uninstall|crash|redist|setup|vcredist|vc_redist|dxsetup|helper|updater|reporter|dotnet)/i;

/** Liste les entrées d'un dossier sans jamais lever d'exception. */
function lire(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
}

/** Cherche récursivement les exécutables candidats. */
function candidats(dir, profondeur, max = 3) {
  const trouves = [];
  for (const e of lire(dir)) {
    const p = path.join(dir, e.name);
    if (e.isFile() && EXT_EXEC.test(e.name) && !IGNORES.test(e.name)) {
      try { trouves.push({ path: p, size: fs.statSync(p).size }); } catch { /* fichier illisible */ }
    } else if (e.isDirectory() && profondeur < max && !e.name.startsWith('.')) {
      trouves.push(...candidats(p, profondeur + 1, max));
    }
  }
  return trouves;
}

/** Taille approximative d'un dossier (plafonnée à `cap` fichiers pour rester rapide). */
function tailleDossier(dir, cap = 20000) {
  let total = 0, vus = 0;
  const pile = [dir];
  while (pile.length && vus < cap) {
    const d = pile.pop();
    for (const e of lire(d)) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) pile.push(p);
      else if (e.isFile()) { vus++; try { total += fs.statSync(p).size; } catch { /* ignoré */ } }
    }
  }
  return total;
}

/**
 * Analyse un répertoire racine et renvoie les jeux détectés.
 * @returns {{name:string, exePath:string, folder:string, sizeBytes:number}[]}
 */
function scanFolder(root) {
  const jeux = [];
  for (const e of lire(root)) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue;
    const dossier = path.join(root, e.name);
    const liste = candidats(dossier, 0).sort((a, b) => b.size - a.size);
    if (liste.length) {
      jeux.push({ name: e.name, exePath: liste[0].path, folder: dossier, sizeBytes: tailleDossier(dossier) });
    }
  }
  return jeux;
}

module.exports = { scanFolder, tailleDossier };
````

---

## `main/services/storage.js`

````javascript
/**
 * storage.js — Persistance JSON de la bibliothèque (jeux, dossiers, sessions, réglages).
 * Indépendant d'Electron : le dossier de données est passé au constructeur (testable avec Node seul).
 */
const fs = require('fs');
const path = require('path');

/** Réglages par défaut (utilisés aussi par « Restaurer par défaut »). */
const DEFAULT_SETTINGS = {
  playerName: 'Joueur',
  fullscreen: false,        // Démarrer en plein écran / Big Picture
  autoLaunchLast: false,    // Relancer automatiquement le dernier jeu joué
  closeOnLaunch: false,     // Fermer le launcher au lancement d'un jeu
  autoDetectExe: true,      // Détection automatique des exécutables
  autoCovers: true,         // Recherche automatique des pochettes manquantes (en ligne)
  screenshotsDir: '',
  profilesDir: '',
  backupDir: '',
  rescanInterval: 'launch', // 'launch' | '30' | '60' (minutes)
  accent: 'cyan',           // 'cyan' | 'violet' | 'emerald'
  density: 'comfortable',   // 'comfortable' | 'compact'
  lastBackup: null          // { date, path, size }
};

class Storage {
  constructor(dir) {
    this.dir = dir;
    this.file = path.join(dir, 'angels-data.json');
    this.data = this._defaults();
    this._timer = null;
  }

  _defaults() {
    return { games: [], folders: [], sessions: [], logs: [], settings: { ...DEFAULT_SETTINGS } };
  }

  /** Charge le fichier ; en cas d'absence ou de corruption, repart d'un état vide. */
  load() {
    try {
      fs.mkdirSync(this.dir, { recursive: true });
      const brut = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      this.data = { ...this._defaults(), ...brut, settings: { ...DEFAULT_SETTINGS, ...(brut.settings || {}) } };
    } catch (e) {
      this.data = this._defaults();
    }
    return this.data;
  }

  /** Écriture différée (regroupe les modifications rapprochées). */
  save() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.flush(), 150);
  }

  /** Écriture atomique : fichier temporaire puis renommage. */
  flush() {
    clearTimeout(this._timer);
    fs.mkdirSync(this.dir, { recursive: true });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.file);
  }

  /** Ajoute une ligne au journal des scans (50 entrées maximum). */
  log(message, type = 'info') {
    this.data.logs.unshift({ time: Date.now(), message, type });
    this.data.logs = this.data.logs.slice(0, 50);
  }

  newId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
}

module.exports = { Storage, DEFAULT_SETTINGS };
````

---

## `packaging/windows/Desinstaller.bat`

````bat
@echo off
REM Desinstaller.bat - Lance la desinstallation d'Angel's Launcher.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Uninstall.ps1"
exit /b
````

---

## `packaging/windows/INSTALLER.bat`

````bat
@echo off
REM ============================================================
REM  INSTALLER.bat - Installe Angel's Launcher pour l'utilisateur courant
REM  (aucun droit administrateur, aucun prerequis : Node.js n'est pas necessaire)
REM ============================================================
setlocal
cd /d "%~dp0"
title Installation - Angel's Launcher

if not exist "app\Angel's Launcher.exe" (
  echo.
  echo  [ERREUR] Les fichiers de l'application sont introuvables.
  echo  Faites un clic droit sur le zip, puis "Extraire tout", et lancez INSTALLER.bat
  echo  depuis le dossier extrait ^(ne le lancez pas depuis l'interieur du zip^).
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-AngelsLauncher.ps1"
if errorlevel 1 (
  echo.
  echo  L'installation a echoue. Consultez le message ci-dessus.
  pause
  exit /b 1
)
endlocal
````

---

## `packaging/windows/Install-AngelsLauncher.ps1`

````powershell
# Install-AngelsLauncher.ps1
# Installe Angel's Launcher dans %LOCALAPPDATA%\Programs\AngelsLauncher (sans droits administrateur),
# cree les raccourcis (Bureau + menu Demarrer) et l'inscrit dans "Applications installees".
# Messages volontairement sans accents : la console Windows n'affiche pas toujours l'UTF-8.

$ErrorActionPreference = 'Stop'
$nom     = 'Angels Launcher'
$exe     = "Angel's Launcher.exe"
$version = '1.1.0'
$src     = Join-Path $PSScriptRoot 'app'
$dest    = Join-Path $env:LOCALAPPDATA 'Programs\AngelsLauncher'
$cleReg  = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AngelsLauncher'

try {
    Write-Host ''
    Write-Host "  ===== Installation d'Angel's Launcher =====" -ForegroundColor Cyan
    Write-Host ''

    if (-not (Test-Path (Join-Path $src $exe))) { throw "Application introuvable dans '$src'." }

    # 1) Fermer l'application si elle tourne (cas d'une mise a jour)
    Write-Host '[1/4] Preparation...'
    Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.Path -and $_.Path.StartsWith($dest, [StringComparison]::OrdinalIgnoreCase) } |
        Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 600

    # 2) Copie des fichiers (installation propre ; vos donnees dans %APPDATA% ne sont jamais touchees)
    Write-Host "[2/4] Copie des fichiers vers $dest ..."
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Copy-Item (Join-Path $src '*') $dest -Recurse -Force
    foreach ($f in 'icon.ico', 'Desinstaller.bat', 'Uninstall.ps1') {
        Copy-Item (Join-Path $PSScriptRoot $f) (Join-Path $dest $f) -Force
    }
    # Retire la marque "telecharge depuis Internet" pour eviter l'alerte SmartScreen a chaque lancement
    Get-ChildItem $dest -Recurse -File -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue

    # 3) Raccourcis
    Write-Host '[3/4] Creation des raccourcis...'
    $wsh = New-Object -ComObject WScript.Shell
    foreach ($dossier in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
        $lnk = $wsh.CreateShortcut((Join-Path $dossier "$nom.lnk"))
        $lnk.TargetPath       = Join-Path $dest $exe
        $lnk.WorkingDirectory = $dest
        $lnk.IconLocation     = Join-Path $dest 'icon.ico'
        $lnk.Description      = "Angel's Launcher"
        $lnk.Save()
    }

    # 4) Inscription dans Parametres > Applications installees (desinstallation propre)
    Write-Host '[4/4] Enregistrement dans Windows...'
    $tailleKo = [int]((Get-ChildItem $dest -Recurse -File | Measure-Object Length -Sum).Sum / 1KB)
    New-Item -Path $cleReg -Force | Out-Null
    $valeurs = [ordered]@{
        DisplayName     = "Angel's Launcher"
        DisplayVersion  = $version
        Publisher       = "Angel's Launcher"
        InstallLocation = $dest
        DisplayIcon     = (Join-Path $dest 'icon.ico')
        UninstallString = '"' + (Join-Path $dest 'Desinstaller.bat') + '"'
        EstimatedSize   = $tailleKo
        NoModify        = 1
        NoRepair        = 1
    }
    foreach ($k in $valeurs.Keys) { Set-ItemProperty -Path $cleReg -Name $k -Value $valeurs[$k] }

    Write-Host ''
    Write-Host '  Installation terminee !' -ForegroundColor Green
    Write-Host "  Raccourci '$nom' ajoute au Bureau et au menu Demarrer."
    Write-Host ''
    $rep = Read-Host '  Lancer Angel''s Launcher maintenant ? [O/n]'
    if ($rep -notmatch '^[nN]') { Start-Process (Join-Path $dest $exe) -WorkingDirectory $dest }
}
catch {
    Write-Host ''
    Write-Host "  [ERREUR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
````

---

## `packaging/windows/LISEZMOI.txt`

````
ANGEL'S LAUNCHER - Installation (Windows 10 / 11)
=================================================

INSTALLER
  1. Clic droit sur le zip > "Extraire tout..."
  2. Dans le dossier extrait, double-cliquez sur  INSTALLER.bat
  3. Suivez les messages : l'application est copiee, les raccourcis sont crees
     (Bureau + menu Demarrer) et le programme apparait dans
     Parametres > Applications > Applications installees.

  - Aucun droit administrateur requis. Aucun logiciel supplementaire (Node.js inutile).
  - Relancer INSTALLER.bat met l'application a jour sans toucher a vos donnees.

SANS INSTALLATION (version portable)
  Double-cliquez directement sur  app\Angel's Launcher.exe

ALERTE WINDOWS "Windows a protege votre PC" (SmartScreen)
  L'application n'est pas signee numeriquement. Cliquez sur "Informations
  complementaires" puis "Executer quand meme". Cette alerte n'apparait qu'une fois.

DESINSTALLER
  Parametres > Applications > Applications installees > Angel's Launcher > Desinstaller
  (ou double-clic sur Desinstaller.bat dans le dossier d'installation :
   %LOCALAPPDATA%\Programs\AngelsLauncher).
  Vos donnees (%APPDATA%\angels-launcher) ne sont supprimees que sur demande.
````

---

## `packaging/windows/Uninstall.ps1`

````powershell
# Uninstall.ps1 - Desinstalle Angel's Launcher (raccourcis, entree Windows, dossier d'installation).
# Vos donnees (bibliotheque, reglages) ne sont supprimees que si vous le demandez.

$nom    = 'Angels Launcher'
$dest   = $PSScriptRoot
$cleReg = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AngelsLauncher'

Write-Host ''
Write-Host "  ===== Desinstallation d'Angel's Launcher =====" -ForegroundColor Cyan
$rep = Read-Host '  Supprimer aussi vos donnees (bibliotheque, reglages) ? [o/N]'

# Fermer l'application
Get-Process -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -and $_.Path.StartsWith($dest, [StringComparison]::OrdinalIgnoreCase) } |
    Stop-Process -Force -ErrorAction SilentlyContinue

# Raccourcis et entree "Applications installees"
foreach ($dossier in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
    Remove-Item (Join-Path $dossier "$nom.lnk") -Force -ErrorAction SilentlyContinue
}
Remove-Item $cleReg -Recurse -Force -ErrorAction SilentlyContinue

if ($rep -match '^[oOyY]') {
    Remove-Item (Join-Path $env:APPDATA 'angels-launcher') -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host '  Donnees supprimees.'
}

# Ce script se trouve dans le dossier a supprimer : on differe la suppression de quelques secondes.
Start-Process cmd.exe -ArgumentList "/c ping 127.0.0.1 -n 3 >nul & rmdir /s /q `"$dest`"" -WindowStyle Hidden
Write-Host '  Angel''s Launcher a ete desinstalle.' -ForegroundColor Green
Start-Sleep -Seconds 2
````

---

## `src/index.html`

````html
<!DOCTYPE html>
<html lang="fr" data-accent="cyan" data-density="comfortable">
<head>
  <meta charset="UTF-8" />
  <!-- CSP stricte : aucun script distant, images locales (file:) et data: autorisées -->
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; img-src 'self' file: data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Angel's Launcher</title>
  <link rel="stylesheet" href="styles/theme.css" />
  <link rel="stylesheet" href="styles/layout.css" />
  <link rel="stylesheet" href="styles/components.css" />
</head>
<body>
  <div id="app">
    <!-- Barre latérale (générée par components/sidebar.js) -->
    <aside id="sidebar"></aside>

    <!-- Barre supérieure : recherche globale, état du scan, profil -->
    <header id="topbar">
      <label class="search">
        <span id="ico-search"></span>
        <input id="search" type="search" placeholder="Rechercher des jeux, exécutables…  (Ctrl+F)" autocomplete="off" />
      </label>
      <div class="topbar-right">
        <span class="chip mono" id="chip-scan"></span>
        <button class="icon-btn" data-action="scanAll" title="Scanner les répertoires" id="btn-sync"></button>
        <button class="icon-btn" data-action="showLogs" title="Dernières notifications" id="btn-bell"></button>
        <span class="divider"></span>
        <span class="user-name" id="top-user"></span>
      </div>
    </header>

    <!-- Contenu de la page courante -->
    <main id="view"></main>
  </div>

  <div id="modal-root"></div>
  <div id="toast-root"></div>

  <script type="module" src="js/app.js"></script>
</body>
</html>
````

---

## `src/js/actions.js`

````javascript
/**
 * actions.js — Gestionnaires d'actions déclenchées par les attributs data-action / data-change / data-input.
 * Chaque fonction reçoit l'élément cliqué ; les données utiles sont dans ses attributs data-*.
 */
import { api } from './services/api.js';
import { store, setUi } from './store.js';
import { toast } from './components/toast.js';
import { ouvrirModale } from './components/modal.js';
import { esc, coverStyle } from './services/format.js';
import { icon } from './services/icons.js';

/** Affiche une erreur renvoyée par le processus principal ; retourne true si l'appel a réussi. */
const verifier = r => { if (r && r.ok === false) { toast(r.error || 'Opération impossible', 'error'); return false; } return true; };

/** Recharge l'occupation des disques (pages Dossiers & Paramètres). */
export async function chargerDisques() {
  const r = await api('disks:list');
  if (Array.isArray(r)) setUi({ disks: r });
}

/** Change de page ; entre dans Paramètres, on travaille sur un brouillon des réglages. */
export function naviguer(page) {
  setUi({ page, draft: page === 'settings' ? { ...store.state.settings } : null });
  if (page === 'folders') chargerDisques();
}

/** Modale d'ajout manuel d'un jeu. */
function modaleAjout() {
  let exe = '', cover = null;
  ouvrirModale({
    titre: 'Ajouter un jeu', confirmer: 'Ajouter',
    corps: `<div class="field"><label>Nom du jeu</label><input class="input" id="g-name" maxlength="60" /></div>
      <div class="field"><label>Sous-titre / édition (facultatif)</label><input class="input" id="g-sub" maxlength="60" /></div>
      <div class="field"><label>Exécutable</label><div class="row" style="flex-wrap:nowrap"><input class="input" id="g-exe" readonly placeholder="Aucun fichier choisi" />
        <button class="btn" id="pick-exe">${icon('folder', 15)} Parcourir</button></div></div>
      <div class="field"><label>Jaquette (facultatif)</label><div class="row" style="flex-wrap:nowrap"><input class="input" id="g-cover" readonly placeholder="Image générée automatiquement" />
        <button class="btn" id="pick-cover">${icon('image', 15)} Choisir</button></div>
        ${store.state.settings.autoCovers ? '<p class="muted">Sans image, la pochette sera recherchée automatiquement en ligne.</p>' : ''}</div>`,
    onBind: el => {
      el.querySelector('#pick-exe').onclick = async () => {
        const p = await api('dialog:exe'); if (!p) return;
        exe = p; el.querySelector('#g-exe').value = p;
        const nom = el.querySelector('#g-name');
        if (!nom.value) nom.value = p.split(/[\\/]/).pop().replace(/\.[^.]+$/, ''); // nom proposé depuis le fichier
      };
      el.querySelector('#pick-cover').onclick = async () => {
        const p = await api('dialog:image'); if (!p) return;
        cover = p; el.querySelector('#g-cover').value = p;
      };
    },
    onConfirm: async el => {
      const r = await api('games:add', { name: el.querySelector('#g-name').value, subtitle: el.querySelector('#g-sub').value, exePath: exe, cover });
      if (r.ok === false) { el.querySelector('#modal-err').textContent = r.error; return false; }
      toast('Jeu ajouté à la bibliothèque', 'success');
    }
  });
}


/** Modale « Pochette » : recherche en ligne (choix du résultat), recherche automatique, image locale, retrait. */
function modaleCouverture(id) {
  const g = store.state.games.find(x => x.id === id); if (!g) return;
  const ctrl = ouvrirModale({
    titre: 'Pochette — ' + g.name, confirmer: 'Fermer', sansAnnuler: true,
    corps: `<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:16px;margin-bottom:14px">
        <div class="thumb" style="${coverStyle(g)};width:90px;height:135px"></div>
        <div style="flex:1;min-width:0"><div class="field"><label>Rechercher en ligne (Steam)</label>
          <div class="row" style="flex-wrap:nowrap"><input class="input" id="c-q" value="${esc(g.name)}" />
          <button class="btn" id="c-search">${icon('search', 15)} Chercher</button></div></div>
          <div id="c-results" class="muted">Lancez une recherche, puis cliquez sur le bon titre.</div></div></div>
      <div class="row"><button class="btn" id="c-auto">${icon('refresh', 15)} Recherche automatique</button>
        <button class="btn" id="c-file">${icon('image', 15)} Image locale…</button>
        <button class="btn danger" id="c-remove">${icon('trash', 15)} Retirer</button></div>
      ${store.state.settings.autoCovers ? '' : '<p class="muted" style="margin-top:10px">La recherche automatique en arrière-plan est désactivée dans les paramètres.</p>'}`,
    onBind: el => {
      const zone = el.querySelector('#c-results'), q = el.querySelector('#c-q');
      const echec = r => { zone.textContent = ''; el.querySelector('#modal-err').textContent = r.error || 'Opération impossible'; };
      const fini = msg => { toast(msg, 'success'); ctrl.fermer(); };

      const chercher = async () => {
        el.querySelector('#modal-err').textContent = ''; zone.textContent = 'Recherche en cours…';
        const r = await api('covers:search', id, q.value);
        if (r.ok === false) return echec(r);
        if (!r.results.length) { zone.textContent = 'Aucun résultat. Essayez un autre nom.'; return; }
        zone.innerHTML = r.results.map(x => `<button class="item result" data-appid="${x.appid}" data-name="${esc(x.name)}"><b>${esc(x.name)}</b><small>#${x.appid}</small></button>`).join('');
        zone.querySelectorAll('.result').forEach(b => b.onclick = async () => {
          zone.textContent = 'Téléchargement…';
          const a = await api('covers:apply', id, Number(b.dataset.appid), b.dataset.name);
          a.ok === false ? echec(a) : fini('Pochette appliquée');
        });
      };
      el.querySelector('#c-search').onclick = chercher;
      q.addEventListener('keydown', e => { if (e.key === 'Enter') chercher(); });

      el.querySelector('#c-auto').onclick = async () => {
        el.querySelector('#modal-err').textContent = ''; zone.textContent = 'Recherche automatique…';
        const r = await api('covers:auto', id);
        r.ok === false ? echec(r) : fini('Pochette trouvée : ' + (r.name || g.name));
      };
      el.querySelector('#c-file').onclick = async () => {
        const p = await api('dialog:image'); if (!p) return;
        const r = await api('covers:setLocal', id, p);
        r.ok === false ? echec(r) : fini('Pochette mise à jour');
      };
      el.querySelector('#c-remove').onclick = async () => { await api('covers:remove', id); fini('Pochette retirée'); };
    },
    onConfirm: () => {}
  });
}

export const actions = {
  nav: el => naviguer(el.dataset.page),

  // ----- Jeux -----
  launch: async el => { const r = await api('games:launch', el.dataset.id); if (verifier(r)) toast('Lancement du jeu…', 'success'); },
  fav: el => api('games:favorite', el.dataset.id),
  openFolder: el => api('games:openFolder', el.dataset.id),
  addGameModal: () => modaleAjout(),
  coverModal: el => modaleCouverture(el.dataset.id),
  coversMissing: async () => {
    const r = await api('covers:fetchMissing');
    if (verifier(r)) toast(r.queued ? `Recherche de ${r.queued} pochette(s) en cours…` : 'Tous les jeux ont déjà une pochette', 'info');
  },
  delGame: el => {
    const g = store.state.games.find(x => x.id === el.dataset.id); if (!g) return;
    ouvrirModale({
      titre: 'Retirer ce jeu ?', confirmer: 'Retirer', danger: true,
      corps: `<p><b>${esc(g.name)}</b> sera retiré de la bibliothèque. Les fichiers du jeu ne sont <b>pas</b> supprimés du disque.</p>`,
      onConfirm: async () => { await api('games:remove', g.id); toast('Jeu retiré', 'success'); }
    });
  },
  loadDemo: async () => { const r = await api('demo:load'); if (verifier(r)) toast(`${r.added} jeux de démonstration ajoutés`, 'success'); },

  // ----- Filtres & tris -----
  setFilter: el => setUi({ filter: el.dataset.id }),
  setFolderFilter: el => setUi({ folderId: el.dataset.id }),
  setFavSort: el => setUi({ favSort: el.dataset.id }),

  // ----- Dossiers surveillés -----
  addFolder: async () => {
    const p = await api('dialog:folder'); if (!p) return;
    const r = await api('folders:add', p);
    if (verifier(r)) toast(`Dossier ajouté — ${r.added} jeu(x) détecté(s)`, 'success');
  },
  removeFolder: el => api('folders:remove', el.dataset.id),
  scanFolder: async el => { const r = await api('folders:scan', el.dataset.id); if (verifier(r)) toast(`${r.added} nouveau(x) jeu(x)`, 'success'); },
  scanAll: async () => { const r = await api('folders:scan', null); if (verifier(r)) toast(`Scan terminé — ${r.added} nouveau(x) jeu(x)`, 'success'); chargerDisques(); },
  openWatched: el => api('folders:open', el.dataset.id),
  selectFolder: el => setUi({ selectedFolder: el.dataset.id }),
  toggleAutoDetect: () => api('settings:save', { autoDetectExe: !store.state.settings.autoDetectExe }),
  showLogs: () => { const l = store.state.logs[0]; toast(l ? l.message : 'Aucune notification', 'info'); },

  // ----- Paramètres (travail sur le brouillon `ui.draft`) -----
  settingsTab: el => setUi({ settingsTab: el.dataset.id }),
  toggle: el => { store.ui.draft[el.dataset.key] = !store.ui.draft[el.dataset.key]; setUi({}); },
  draftValue: el => { store.ui.draft[el.dataset.key] = el.dataset.value; setUi({}); },
  pick: async el => { const p = await api('dialog:folder'); if (p) { store.ui.draft[el.dataset.key] = p; setUi({}); } },
  saveSettings: async () => { if (verifier(await api('settings:save', store.ui.draft))) toast('Réglages enregistrés', 'success'); },
  resetSettings: async () => {
    if (!verifier(await api('settings:reset'))) return;
    setUi({ draft: { ...store.state.settings } }); toast('Réglages par défaut restaurés', 'success');
  },
  createBackup: async () => {
    await api('settings:save', store.ui.draft); // le dossier choisi doit être enregistré avant la copie
    const r = await api('backup:create'); if (verifier(r)) toast('Sauvegarde créée', 'success');
    setUi({ draft: { ...store.state.settings } });
  },
  openBackup: () => api('backup:open'),
  rumble: el => {
    const pad = navigator.getGamepads()[Number(el.dataset.index)];
    if (pad?.vibrationActuator) pad.vibrationActuator.playEffect('dual-rumble', { duration: 500, strongMagnitude: 1, weakMagnitude: 1 });
    else toast('Cette manette ne gère pas la vibration', 'error');
  }
};

/** Actions liées à un changement de valeur (liste déroulante). */
export const changes = {
  setSort: el => setUi({ sort: el.value }),
  draftSelect: el => { store.ui.draft[el.dataset.key] = el.value; setUi({}); }
};
````

---

## `src/js/app.js`

````javascript
/**
 * app.js — Point d'entrée de l'interface : rendu, délégation d'évènements, raccourcis clavier.
 */
import { store, setState, setUi, subscribe } from './store.js';
import { api, ecouter } from './services/api.js';
import { icon } from './services/icons.js';
import { renderSidebar } from './components/sidebar.js';
import { toast } from './components/toast.js';
import { renderLibrary } from './pages/library.js';
import { renderFolders } from './pages/folders.js';
import { renderRecent } from './pages/recent.js';
import { renderFavorites } from './pages/favorites.js';
import { renderSettings } from './pages/settings.js';
import { actions, changes, naviguer } from './actions.js';

const PAGES = { library: renderLibrary, folders: renderFolders, recent: renderRecent, favorites: renderFavorites, settings: renderSettings };
const ORDRE = ['library', 'folders', 'recent', 'favorites', 'settings'];
const $ = id => document.getElementById(id);

/** Redessine l'interface complète à partir du store. */
function render() {
  const { state, ui } = store;
  // Thème : le brouillon s'applique en direct dans Paramètres, sinon les réglages enregistrés
  const t = ui.page === 'settings' && ui.draft ? ui.draft : state.settings;
  document.documentElement.dataset.accent = t.accent || 'cyan';
  document.documentElement.dataset.density = t.density || 'comfortable';

  $('sidebar').innerHTML = renderSidebar(ui.page, state.settings);
  $('top-user').textContent = state.settings.playerName || 'Joueur';
  $('chip-scan').textContent = state.settings.autoDetectExe ? 'Scan auto' : 'Scan manuel';

  const vue = $('view'), defil = vue.scrollTop;
  vue.innerHTML = PAGES[ui.page](state, ui);
  vue.scrollTop = defil; // conserve la position de défilement entre deux rendus
}

async function demarrer() {
  $('ico-search').innerHTML = icon('search');
  $('btn-sync').innerHTML = icon('refresh');
  $('btn-bell').innerHTML = icon('bell');

  subscribe(render);
  ecouter('state:changed', setState);                 // l'état poussé par le processus principal
  ecouter('toast', t => toast(t.message, t.type));
  setState(await api('state:get'));

  // Délégation : un seul écouteur pour tous les boutons de l'application
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (el && actions[el.dataset.action]) actions[el.dataset.action](el, e);
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-change]');
    if (el && changes[el.dataset.change]) changes[el.dataset.change](el);
  });
  document.addEventListener('input', e => {
    const el = e.target.closest('[data-input]');
    if (el && store.ui.draft) store.ui.draft[el.dataset.input] = el.value; // sans re-rendu : garde le focus
  });

  // Recherche globale : bascule vers la bibliothèque depuis une page sans liste de jeux
  $('search').addEventListener('input', e => {
    const page = ['library', 'favorites', 'recent'].includes(store.ui.page) ? store.ui.page : 'library';
    setUi({ query: e.target.value, page });
  });

  // Raccourcis clavier
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === 'f') { e.preventDefault(); $('search').focus(); }
    else if (e.key === 'n') { e.preventDefault(); actions.addGameModal(); }
    else if (/^[1-5]$/.test(e.key)) { e.preventDefault(); naviguer(ORDRE[Number(e.key) - 1]); }
  });

  // Les manettes n'apparaissent qu'après un appui : on rafraîchit la page Paramètres si elle est ouverte
  window.addEventListener('gamepadconnected', () => store.ui.page === 'settings' && setUi({}));
  window.addEventListener('gamepaddisconnected', () => store.ui.page === 'settings' && setUi({}));
}

demarrer();
````

---

## `src/js/store.js`

````javascript
/** store.js — État global de l'interface : données (venant du processus principal) + état d'affichage. */
export const store = {
  state: { games: [], folders: [], sessions: [], logs: [], settings: {}, running: [], coverQueue: [] },
  ui: {
    page: 'library', query: '', filter: 'all', sort: 'recent', folderId: 'all',
    favSort: 'playtime', settingsTab: 'general', draft: null, selectedFolder: null, disks: []
  }
};
const abonnes = new Set();
export const subscribe = fn => abonnes.add(fn);
const notifier = () => abonnes.forEach(fn => fn(store));
export function setState(etat) { store.state = etat; notifier(); }
export function setUi(patch) { Object.assign(store.ui, patch); notifier(); }
````

---

## `src/js/components/gameCard.js`

````javascript
/** gameCard.js — Carte de jeu (grille) et ligne de jeu (liste). */
import { esc, heures, coverStyle, initiale, taille, relatif } from '../services/format.js';
import { icon } from '../services/icons.js';

/** Badge d'état : en cours / prêt / non installé. */
function badge(g, enCours) {
  if (enCours) return '<span class="badge run">En cours</span>';
  return g.installed || g.demo ? '<span class="badge">Prêt</span>' : '<span class="badge off">Introuvable</span>';
}

/** Carte verticale 2:3 avec actions au survol. */
export function gameCard(g, state) {
  const enCours = state.running.includes(g.id);
  return `<article class="card">
    <div class="cover${(state.coverQueue || []).includes(g.id) ? ' searching' : ''}" style="${coverStyle(g)}">
      ${g.cover ? '' : `<div class="initial">${initiale(g)}</div>`}
      ${badge(g, enCours)}
      <div class="card-actions">
        <button class="icon-btn hov" data-action="coverModal" data-id="${g.id}" title="Pochette du jeu">${icon('image', 15)}</button>
        <button class="icon-btn hov" data-action="delGame" data-id="${g.id}" title="Retirer de la bibliothèque">${icon('trash', 15)}</button>
        <button class="icon-btn ${g.favorite ? 'on' : ''}" data-action="fav" data-id="${g.id}" title="Favori">${icon('heart', 15)}</button>
      </div>
      <div class="play-overlay"><button data-action="launch" data-id="${g.id}" title="Jouer">${icon('play', 26)}</button></div>
      <div class="cover-info">
        <div class="path" title="${esc(g.exePath)}">${esc(g.folder)}</div>
        <h3>${esc(g.name)}</h3>
        <div class="meta"><span>${icon('clock', 12)} <b>${heures(g.playtime)}</b></span><span>${esc(g.subtitle || taille(g.sizeBytes))}</span></div>
      </div>
    </div></article>`;
}

/** Ligne horizontale (page « Récemment ajoutés »). */
export function gameRow(g) {
  return `<div class="game-row">
    <div class="thumb" style="${coverStyle(g)}"></div>
    <div class="info"><h3>${esc(g.name)}</h3>
      <div class="mono"><span>Ajouté ${relatif(g.addedAt)}</span><span>${esc(g.folder)}</span></div></div>
    <span class="chip mono">${taille(g.sizeBytes)}</span>
    <button class="btn" data-action="launch" data-id="${g.id}">${icon('play', 14)} Lancer</button>
    <button class="icon-btn" data-action="openFolder" data-id="${g.id}" title="Afficher dans l'explorateur">${icon('folder')}</button>
  </div>`;
}
````

---

## `src/js/components/modal.js`

````javascript
/** modal.js — Fenêtre modale générique (Échap ou clic hors zone pour fermer). */
import { esc } from '../services/format.js';

/**
 * @param {object} o  { titre, corps (HTML), confirmer (libellé), danger, sansAnnuler, onBind(el), onConfirm(el) → false pour rester ouverte }
 */
export function ouvrirModale(o) {
  const racine = document.getElementById('modal-root');
  racine.innerHTML = `<div class="modal-bg"><div class="modal" role="dialog">
    <h2>${esc(o.titre)}</h2><div id="modal-body">${o.corps}</div><div class="err" id="modal-err"></div>
    <div class="actions">${o.sansAnnuler ? '' : '<button class="btn" id="modal-cancel">Annuler</button>'}
    <button class="btn ${o.danger ? 'danger' : 'primary'}" id="modal-ok">${esc(o.confirmer || 'Valider')}</button></div></div></div>`;
  const fermer = () => { racine.innerHTML = ''; document.removeEventListener('keydown', surTouche); };
  const surTouche = e => { if (e.key === 'Escape') fermer(); };
  document.addEventListener('keydown', surTouche);
  const bg = racine.firstElementChild;
  bg.addEventListener('mousedown', e => { if (e.target === bg) fermer(); });
  const annuler = racine.querySelector('#modal-cancel'); if (annuler) annuler.onclick = fermer;
  racine.querySelector('#modal-ok').onclick = async () => {
    const r = await o.onConfirm?.(racine);
    if (r === false) return;
    fermer();
  };
  o.onBind?.(racine);
  racine.querySelector('input')?.focus();
  return { fermer, erreur: m => { racine.querySelector('#modal-err').textContent = m; } };
}
````

---

## `src/js/components/sidebar.js`

````javascript
/** sidebar.js — Barre latérale de navigation + carte profil. */
import { icon } from '../services/icons.js';
import { esc } from '../services/format.js';

const NAV = [
  ['library', 'Ma Bibliothèque', 'library'], ['folders', 'Dossiers & Disques', 'disk'],
  ['recent', 'Récemment ajoutés', 'history'], ['favorites', 'Favoris', 'heart']
];

export function renderSidebar(page, settings) {
  const item = ([id, label, ico]) =>
    `<button class="nav-item ${page === id ? 'active' : ''}" data-action="nav" data-page="${id}" title="${label}">${icon(ico, 20)}<span>${label}</span></button>`;
  return `
    <div class="brand"><div class="brand-logo">A</div><div><b>ANGEL'S<br>LAUNCHER</b><small>OS • LOCAL HUB</small></div></div>
    <div class="nav-title">Plateforme</div>
    ${NAV.map(item).join('')}
    <div class="nav-title">Configuration</div>
    ${item(['settings', 'Paramètres', 'sliders'])}
    <div class="profile"><div class="avatar">${icon('user')}</div>
      <div><b>${esc(settings.playerName || 'Joueur')}</b><small>Bibliothèque locale</small></div></div>`;
}
````

---

## `src/js/components/toast.js`

````javascript
/** toast.js — Notifications éphémères en bas à droite. */
import { esc } from '../services/format.js';

export function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = esc(message);
  document.getElementById('toast-root').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
````

---

## `src/js/pages/favorites.js`

````javascript
/** favorites.js — Page « Favoris » : coup de cœur, grille rapide, statistiques. */
import { esc, heures, coverStyle, relatif } from '../services/format.js';
import { icon } from '../services/icons.js';
import { rechercher, trier, dossierDuJeu, tempsTotal } from '../services/selectors.js';
import { gameCard } from '../components/gameCard.js';

export function renderFavorites(state, ui) {
  const tous = state.games.filter(g => g.favorite);
  const mode = { playtime: 'playtime', name: 'name', recent: 'recent' }[ui.favSort];
  const favs = trier(rechercher(tous, ui.query), mode);
  const tab = (id, l) => `<button class="tab ${ui.favSort === id ? 'active' : ''}" data-action="setFavSort" data-id="${id}">${l}</button>`;
  const entete = `<div class="page-head"><div><div class="eyebrow">ANGEL'S // Collection • ${tous.length} titre(s) épinglé(s)</div>
      <h1>Mes Jeux Favoris</h1><p>Accédez instantanément à vos titres préférés. Cliquez sur le cœur d'une carte pour la retirer.</p></div>
      <div class="tabs">${tab('playtime', 'Plus joués')}${tab('name', 'Alphabétique')}${tab('recent', 'Récents')}</div></div>`;
  if (!favs.length) return entete + `<div class="empty"><h2>Aucun favori</h2><p>Ajoutez des jeux en favoris depuis la bibliothèque (icône ${icon('heart', 14)}).</p></div>`;

  const v = favs[0];
  const total = tempsTotal(state.games), cumul = tempsTotal(tous);
  // Répartition des favoris par dossier surveillé
  const parDossier = {};
  tous.forEach(g => { const f = dossierDuJeu(state, g); const k = f ? f.name : 'Hors dossiers'; parDossier[k] = (parDossier[k] || 0) + 1; });
  const repart = Object.entries(parDossier).map(([k, n]) =>
    `<div class="item"><span>${esc(k)}</span><span class="chip">${n} jeu(x)</span></div>`).join('');
  return `${entete}
    <section class="panel" style="display:grid;grid-template-columns:1.4fr 1fr;padding:0;overflow:hidden;margin-bottom:24px">
      <div style="min-height:260px;${coverStyle(v)};background-size:cover;background-position:center"></div>
      <div class="stack" style="padding:24px;justify-content:space-between">
        <div><span class="chip ok">Coup de cœur // prioritaire</span><h1 style="margin-top:10px">${esc(v.name)}</h1>
          <p class="muted">${esc(v.subtitle || '')}</p><div class="mono muted" style="margin-top:8px;word-break:break-all">${icon('folder', 13)} ${esc(v.exePath)}</div></div>
        <div class="row between"><div><small class="muted mono">SESSION LOCALE</small><div class="accent" style="font:700 22px var(--font-head)">${heures(v.playtime)} <span class="muted" style="font:400 13px var(--font-body)">jouées</span></div></div>
          <button class="btn primary" data-action="launch" data-id="${v.id}">${icon('play', 14)} Lancer</button></div></div></section>
    <div class="cols"><div><div class="eyebrow muted">Bibliothèque rapide</div><div class="grid-cards">${favs.map(g => gameCard(g, state)).join('')}</div></div>
      <aside class="panel"><h2>${icon('chart')} Statistiques favoris</h2>
        <div class="stat"><small class="mono">TEMPS CUMULÉ</small><b class="accent" style="font-size:34px">${heures(cumul)}</b>
          <p class="muted">Représente ${total ? Math.round(cumul / total * 100) : 0} % de votre temps total sur Angel's Launcher.</p></div>
        <div class="eyebrow muted" style="margin-top:16px">Répartition par dossier</div>${repart}
        <p class="muted mono" style="margin-top:14px">Dernier lancé : ${relatif(Math.max(...tous.map(g => g.lastPlayed || 0)))}</p></aside></div>`;
}
````

---

## `src/js/pages/folders.js`

````javascript
/** folders.js — Page « Dossiers & Disques » : occupation des disques, dossiers surveillés, aperçu. */
import { esc, taille, relatif, coverStyle, initiale } from '../services/format.js';
import { icon } from '../services/icons.js';

function carteDisque(d) {
  const pct = d.total ? Math.round(d.used / d.total * 100) : 0;
  return `<div class="disk"><div class="row between"><div>${icon('disk', 22)}</div><span class="chip mono">${pct} %</span></div>
    <h3 style="margin-top:10px">${esc(d.label)}</h3><div class="mono muted" style="word-break:break-all">${esc(d.mount)}</div>
    <div class="row between" style="margin:14px 0 6px"><b>${taille(d.used)} / ${taille(d.total)}</b><span class="accent mono">${taille(d.free)} libres</span></div>
    <div class="bar ${pct > 85 ? '' : 'violet'}"><i style="width:${pct}%;${pct > 90 ? 'background:var(--danger)' : ''}"></i></div></div>`;
}

export function renderFolders(state, ui) {
  const sel = state.folders.find(f => f.id === ui.selectedFolder) || state.folders[0];
  const jeuxDe = f => state.games.filter(g => g.exePath.startsWith(f.path));
  // Alerte : un disque presque plein (> 90 %)
  const plein = ui.disks.find(d => d.total && d.used / d.total > 0.9);
  const bandeau = plein
    ? `<div class="panel row" style="margin-bottom:24px;border-color:var(--danger)">${icon('disk', 22)}<div><b>${esc(plein.label)}</b> est presque plein : seulement ${taille(plein.free)} disponibles.</div></div>` : '';
  const dossiers = state.folders.map(f => {
    const n = jeuxDe(f);
    return `<div class="folder ${sel && sel.id === f.id ? 'sel' : ''}" data-action="selectFolder" data-id="${f.id}">
      <div class="row between"><div class="row">${icon('folder', 22)}<div><b>${esc(f.name)}</b>${f.autoSync ? ' <span class="chip info">Auto-sync</span>' : ''}<div class="path">${esc(f.path)}</div></div></div>
        <div style="text-align:right"><b>${n.length} titres</b><div class="mono muted">${taille(n.reduce((s, g) => s + g.sizeBytes, 0))}</div></div></div>
      <div class="row between" style="margin-top:12px"><span class="mono green">${f.lastScan ? icon('check', 13) + ' Scanné ' + relatif(f.lastScan).toLowerCase() : 'Jamais scanné'}</span>
        <div class="row"><button class="btn sm" data-action="scanFolder" data-id="${f.id}">${icon('refresh', 13)} Re-scanner</button>
          <button class="btn sm" data-action="openWatched" data-id="${f.id}">${icon('folder', 13)} Explorateur</button>
          <button class="btn sm danger" data-action="removeFolder" data-id="${f.id}">Délier</button></div></div></div>`;
  }).join('') || '<div class="empty">Aucun dossier surveillé. Ajoutez le dossier où sont installés vos jeux.</div>';

  const apercu = sel ? (() => {
    const n = jeuxDe(sel);
    return `<aside class="panel"><div class="eyebrow">Aperçu répertoire</div><h2>${esc(sel.name)} <span class="chip">${n.length} jeux</span></h2>
      <p class="muted mono" style="word-break:break-all">${esc(sel.path)}</p>
      <div class="grid-cards" style="grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">${n.slice(0, 6).map(g => `<div class="card"><div class="cover" style="${coverStyle(g)};aspect-ratio:16/10">
        ${g.cover ? '' : `<div class="initial" style="font-size:32px">${initiale(g)}</div>`}<div class="cover-info"><h3 style="font-size:13px">${esc(g.name)}</h3><div class="mono muted">${taille(g.sizeBytes)}</div></div></div></div>`).join('')}</div>
      ${n.length ? '' : '<p class="muted">Aucun jeu dans ce dossier.</p>'}</aside>`;
  })() : '';

  return `<div class="page-head"><div><div class="eyebrow">Indexation système</div><h1>Gestionnaire de Stockage & Répertoires</h1>
      <p>Surveillez l'occupation de vos disques et synchronisez automatiquement vos dossiers de jeux.</p></div>
      <div class="row"><button class="btn" data-action="scanAll">${icon('refresh')} Scanner le système</button>
        <button class="btn primary" data-action="addFolder">${icon('plus', 16)} Ajouter un répertoire</button></div></div>
    <div class="grid-3" style="margin-bottom:24px">${ui.disks.map(carteDisque).join('') || '<div class="empty">Lecture des disques…</div>'}</div>
    ${bandeau}
    <div class="cols"><div><h2 style="margin-bottom:14px">Dossiers indexés <span class="chip">${state.folders.length} emplacement(s)</span></h2>${dossiers}
      <div class="toggle-row"><div><b>Surveillance continue des exécutables</b><p>Détecte automatiquement les nouvelles installations selon l'intervalle défini dans les paramètres.</p></div>
        <button class="toggle ${state.settings.autoDetectExe ? 'on' : ''}" data-action="toggleAutoDetect" aria-label="Surveillance"></button></div></div>${apercu}</div>`;
}
````

---

## `src/js/pages/library.js`

````javascript
/** library.js — Page « Ma Bibliothèque » : héros, filtres, grille de jeux, widgets latéraux. */
import { esc, heures, duree, coverStyle, taille, relatif, heureFr } from '../services/format.js';
import { icon } from '../services/icons.js';
import { rechercher, trier, dossierDuJeu, jeuMisEnAvant, tempsTotal } from '../services/selectors.js';
import { gameCard } from '../components/gameCard.js';

function hero(g, state) {
  const enCours = state.running.includes(g.id);
  const dernier = state.sessions.find(s => s.gameId === g.id);
  return `<section class="hero" style="${coverStyle(g)}">
    <div class="row"><span class="chip mono" title="${esc(g.exePath)}">${icon('folder', 13)} ${esc(g.folder)}</span>
      <span class="chip ${g.installed || g.demo ? 'ok' : ''}">${g.installed || g.demo ? icon('check', 13) + ' Vérifié & prêt' : 'Exécutable introuvable'}</span></div>
    <div class="eyebrow">Mise en avant • Reprendre la partie</div>
    <h1>${esc(g.name)}</h1>${g.subtitle ? `<div class="sub">${esc(g.subtitle)}</div>` : ''}
    <div class="row mono muted"><span>${icon('clock', 14)} ${heures(g.playtime)} jouées</span>
      <span>• Dernière session : ${g.lastPlayed ? relatif(g.lastPlayed) + (dernier ? ', ' + heureFr(dernier.end).slice(0, 5) : '') : 'jamais'}</span></div>
    <div class="row"><button class="btn primary xl" data-action="launch" data-id="${g.id}">${icon('play', 16)} ${enCours ? 'En cours…' : 'Jouer'}</button>
      <button class="btn" data-action="openFolder" data-id="${g.id}">${icon('folder')} Gérer les fichiers</button>
      <button class="btn" data-action="coverModal" data-id="${g.id}">${icon('image')} Pochette</button></div>
  </section>`;
}

function filtres(state, ui, nbTotal, nbAffiches) {
  const puces = state.folders.map(f =>
    `<button class="chip ${ui.folderId === f.id ? 'active' : ''}" data-action="setFolderFilter" data-id="${f.id}">${icon('disk', 13)} ${esc(f.name)}</button>`).join('');
  const tab = (id, l) => `<button class="tab ${ui.filter === id ? 'active' : ''}" data-action="setFilter" data-id="${id}">${l}</button>`;
  return `<div class="panel"><div class="eyebrow muted">Répertoires scannés</div>
      <div class="row"><button class="chip ${ui.folderId === 'all' ? 'active' : ''}" data-action="setFolderFilter" data-id="all">Tous (${nbTotal})</button>${puces}</div></div>
    <div class="row between"><div><b>${nbAffiches}</b> jeu(x) affiché(s) <span class="muted mono">• ${taille(state.games.reduce((s, g) => s + g.sizeBytes, 0))} alloués</span></div>
      <div class="row">
        <select class="input" style="flex:none;width:180px" data-change="setSort">
          ${[['recent', 'Récemment joués'], ['name', 'Nom (A-Z)'], ['playtime', 'Temps de jeu'], ['added', 'Date d\'ajout']]
            .map(([v, l]) => `<option value="${v}" ${ui.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <div class="tabs">${tab('all', 'Tous')}${tab('installed', 'Installés')}${tab('fav', 'Favoris')}</div>
        <button class="btn primary sm" data-action="addGameModal">${icon('plus', 14)} Ajouter un jeu</button></div></div>`;
}

function aside(state, vedette) {
  const manquantes = state.games.filter(g => !g.cover && g.coverSource !== 'none').length; // jeux sans pochette
  const total = tempsTotal(state.games);
  const plus = [...state.games].sort((a, b) => b.playtime - a.playtime)[0];
  const sessions = state.sessions.slice(0, 3).map(s => `<div class="item"><div><b>${esc(s.name)}</b><div class="mono muted">${relatif(s.end)}</div></div><span class="chip ok">${duree(s.seconds)}</span></div>`).join('')
    || '<p class="muted">Aucune session enregistrée pour le moment.</p>';
  return `<aside class="stack">
    <div class="panel"><h2>${icon('chart')} Statistiques locales</h2>
      <div class="row"><div class="stat" style="flex:1"><small>Temps total</small><b>${heures(total)}</b></div>
        <div class="stat" style="flex:1"><small>Favoris</small><b>${state.games.filter(g => g.favorite).length}</b></div></div>
      ${plus && plus.playtime ? `<div class="item"><div><b>Jeu le plus joué</b><div class="mono muted">${esc(plus.name)}</div></div><span class="chip info">${heures(plus.playtime)}</span></div>` : ''}</div>
    <div class="panel"><h2>${icon('history')} Sessions récentes</h2>${sessions}</div>
    <div class="panel"><h2>${icon('sliders')} Accès rapide local</h2>
      ${vedette ? `<button class="item" data-action="openFolder" data-id="${vedette.id}"><span>${icon('folder')} Ouvrir le dossier d'installation</span>${icon('chevron')}</button>` : ''}
      ${manquantes ? `<button class="item" data-action="coversMissing"><span>${icon('image')} Rechercher les pochettes manquantes (${manquantes})</span>${icon('chevron')}</button>` : ''}
      <button class="item" data-action="addGameModal"><span>${icon('plus')} Ajouter un jeu manuellement</span>${icon('chevron')}</button>
      <button class="item" data-action="nav" data-page="settings"><span>${icon('save')} Gestionnaire de sauvegardes</span>${icon('chevron')}</button></div>
  </aside>`;
}

export function renderLibrary(state, ui) {
  if (!state.games.length) {
    return `<div class="empty"><h2>Votre bibliothèque est vide</h2>
      <p>Ajoutez un jeu, surveillez un dossier d'installation, ou chargez des jeux de démonstration.</p>
      <div class="row" style="justify-content:center;margin-top:18px">
        <button class="btn primary" data-action="addGameModal">${icon('plus', 14)} Ajouter un jeu</button>
        <button class="btn" data-action="addFolder">${icon('folder')} Surveiller un dossier</button>
        <button class="btn" data-action="loadDemo">Charger la démo</button></div></div>`;
  }
  let jeux = rechercher(state.games, ui.query);
  if (ui.folderId !== 'all') {
    const f = state.folders.find(x => x.id === ui.folderId);
    jeux = jeux.filter(g => f && dossierDuJeu(state, g) === f);
  }
  if (ui.filter === 'installed') jeux = jeux.filter(g => g.installed || g.demo);
  if (ui.filter === 'fav') jeux = jeux.filter(g => g.favorite);
  jeux = trier(jeux, ui.sort);
  const vedette = jeuMisEnAvant(state.games);
  return `${hero(vedette, state)}
    <div class="cols"><div class="stack">${filtres(state, ui, state.games.length, jeux.length)}
      ${jeux.length ? `<div class="grid-cards">${jeux.map(g => gameCard(g, state)).join('')}</div>`
                    : '<div class="empty">Aucun jeu ne correspond à votre recherche.</div>'}</div>
    ${aside(state, vedette)}</div>`;
}
````

---

## `src/js/pages/recent.js`

````javascript
/** recent.js — Page « Récemment ajoutés » : détections groupées par période + journal des scans. */
import { esc, taille, relatif, heureFr, coverStyle, initiale } from '../services/format.js';
import { icon } from '../services/icons.js';
import { rechercher, trier } from '../services/selectors.js';
import { gameRow } from '../components/gameCard.js';

const JOUR = 86400000;

function carteSemaine(g) {
  return `<div class="panel stack" style="gap:12px">
    <div class="cover" style="${coverStyle(g)};aspect-ratio:16/9;border-radius:12px;overflow:hidden">${g.cover ? '' : `<div class="initial">${initiale(g)}</div>`}
      <div class="cover-info"><span class="mono accent">${relatif(g.addedAt).toUpperCase()}</span><h3>${esc(g.name)}</h3></div></div>
    <div class="mono muted" style="word-break:break-all">${icon('folder', 13)} ${esc(g.exePath)}</div>
    <div class="row"><button class="btn primary" style="flex:1" data-action="launch" data-id="${g.id}">${icon('play', 14)} Lancer</button>
      <button class="icon-btn" data-action="openFolder" data-id="${g.id}">${icon('folder')}</button></div></div>`;
}

export function renderRecent(state, ui) {
  const jeux = trier(rechercher(state.games, ui.query), 'added');
  const age = g => Date.now() - g.addedAt;
  const semaine = jeux.filter(g => age(g) <= 7 * JOUR), mois = jeux.filter(g => age(g) > 7 * JOUR && age(g) <= 30 * JOUR), ancien = jeux.filter(g => age(g) > 30 * JOUR);
  const section = (titre, liste, rendu, grille) => liste.length
    ? `<h2 style="margin:28px 0 14px">${titre} <span class="chip">${liste.length}</span></h2>${grille ? `<div class="grid-3">${liste.map(rendu).join('')}</div>` : liste.map(rendu).join('')}` : '';
  const logs = state.logs.slice(0, 5).map(l => `<div class="log"><span class="accent">[${heureFr(l.time)}]</span><span>${esc(l.message)}</span></div>`).join('')
    || '<p class="muted">Aucun scan effectué pour le moment.</p>';
  return `<section class="panel row between" style="margin-bottom:8px"><div><div class="eyebrow">${semaine.length} nouveau(x) jeu(x) cette semaine</div>
      <h1>Récemment ajoutés</h1><p class="muted">Jeux et exécutables détectés lors des derniers scans ou ajoutés manuellement.</p></div>
      <button class="btn primary" data-action="scanAll">${icon('refresh', 16)} Forcer un scan complet</button></section>
    <div class="row mono muted" style="margin:14px 0"><span class="chip ok">${taille(state.games.reduce((s, g) => s + g.sizeBytes, 0))} indexés</span><span class="chip">${state.games.length} jeu(x)</span></div>
    ${jeux.length ? '' : '<div class="empty">Aucun jeu à afficher.</div>'}
    ${section('Cette semaine', semaine, carteSemaine, true)}${section('Ce mois-ci', mois, gameRow)}${section('Plus ancien', ancien, gameRow)}
    <div class="panel" style="margin-top:28px"><h2>${icon('history')} Journal des derniers scans</h2>${logs}
      <p class="muted mono" style="margin-top:12px">Surveillance : ${state.settings.autoDetectExe ? 'active' : 'désactivée'} • ${state.folders.length} dossier(s) surveillé(s)</p></div>`;
}
````

---

## `src/js/pages/settings.js`

````javascript
/** settings.js — Page « Paramètres » : onglets Général, Affichage, Manettes, Raccourcis, Sauvegardes. */
import { esc, taille, heureFr } from '../services/format.js';
import { icon } from '../services/icons.js';

const TABS = [['general', 'Général', 'sliders'], ['display', 'Affichage & Thème', 'monitor'], ['pads', 'Contrôleurs & Manettes', 'gamepad'],
  ['keys', 'Audio & Raccourcis', 'volume'], ['saves', 'Sauvegardes locales', 'save']];

const bascule = (cle, d, titre, desc, note = '') =>
  `<div class="toggle-row"><div><b>${titre}</b> ${note ? `<span class="chip mono">${note}</span>` : ''}<p>${desc}</p></div>
   <button class="toggle ${d[cle] ? 'on' : ''}" data-action="toggle" data-key="${cle}" aria-label="${titre}"></button></div>`;

const chemin = (cle, d, titre) =>
  `<div class="field"><label>${titre}</label><div class="row" style="flex-wrap:nowrap"><input class="input" readonly value="${esc(d[cle] || 'Non défini')}" title="${esc(d[cle])}" />
   <button class="btn" data-action="pick" data-key="${cle}">${icon('folder', 15)} Parcourir</button></div></div>`;

function general(d) {
  return `<div class="cols" style="grid-template-columns:1fr 1fr">
    <div class="panel"><h2>${icon('power')} Comportement du launcher</h2>
      <div class="field"><label>Nom du joueur</label><input class="input" data-input="playerName" value="${esc(d.playerName)}" maxlength="24" /></div>
      ${bascule('fullscreen', d, 'Démarrer en plein écran / Big Picture', 'Ouvre directement la fenêtre en plein écran au prochain démarrage.')}
      ${bascule('autoLaunchLast', d, 'Lancer automatiquement le dernier jeu joué', 'Relance votre dernière session dès l\'ouverture du launcher.')}
      ${bascule('closeOnLaunch', d, 'Fermer le launcher lors du lancement d\'un jeu', 'Libère de la mémoire (le temps de jeu n\'est alors plus comptabilisé).', 'RAM boost')}
      ${bascule('autoDetectExe', d, 'Détection automatique des exécutables', 'Scanne les dossiers surveillés au démarrage et à intervalle régulier.')}
      ${bascule('autoCovers', d, 'Recherche automatique des pochettes', 'Télécharge les pochettes manquantes depuis Steam. Seul le nom du jeu est envoyé ; désactivez pour rester 100 % hors-ligne.', 'En ligne')}</div>
    <div class="panel"><h2>${icon('folder')} Répertoires & chemins</h2>
      ${chemin('screenshotsDir', d, 'Répertoire des captures d\'écran et clips')}${chemin('profilesDir', d, 'Dossier de sauvegarde des profils de manette')}
      <div class="field"><label>Intervalle de re-scan des disques locaux</label><select class="input" data-change="draftSelect" data-key="rescanInterval">
        ${[['launch', 'Au lancement du launcher uniquement'], ['30', 'Toutes les 30 minutes'], ['60', 'Toutes les heures']]
          .map(([v, l]) => `<option value="${v}" ${d.rescanInterval === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div></div>`;
}

function affichage(d) {
  const sw = (id, couleur) => `<button class="swatch ${d.accent === id ? 'sel' : ''}" style="background:${couleur}" data-action="draftValue" data-key="accent" data-value="${id}" title="${id}"></button>`;
  return `<div class="panel"><h2>${icon('monitor')} Affichage & thème</h2>
    <div class="field"><label>Couleur d'accent</label><div class="row">${sw('cyan', '#4cd7f6')}${sw('violet', '#a078ff')}${sw('emerald', '#4edea3')}</div></div>
    <div class="field"><label>Densité de l'interface</label><select class="input" style="max-width:280px" data-change="draftSelect" data-key="density">
      <option value="comfortable" ${d.density === 'comfortable' ? 'selected' : ''}>Confortable</option><option value="compact" ${d.density === 'compact' ? 'selected' : ''}>Compacte</option></select></div>
    <p class="muted">L'aperçu est immédiat ; cliquez sur « Enregistrer les modifications » pour le conserver.</p></div>`;
}

/** Les manettes viennent de l'API Gamepad du navigateur (aucun accès natif nécessaire). */
function manettes() {
  const pads = [...(navigator.getGamepads?.() || [])].filter(Boolean);
  return `<div class="panel"><h2>${icon('gamepad')} Contrôleurs détectés <span class="chip">${pads.length} actif(s)</span></h2>
    ${pads.map(p => `<div class="item"><div><b>${esc(p.id)}</b><div class="mono muted">${p.buttons.length} boutons • ${p.axes.length} axes</div></div>
      <button class="btn sm" data-action="rumble" data-index="${p.index}">Tester la vibration</button></div>`).join('')
      || '<p class="muted">Aucune manette détectée. Branchez-en une puis appuyez sur un bouton pour qu\'elle apparaisse.</p>'}</div>`;
}

function raccourcis() {
  const l = [['Ctrl + F', 'Aller à la recherche'], ['Ctrl + N', 'Ajouter un jeu'], ['Ctrl + 1 … 5', 'Bibliothèque, Dossiers, Récents, Favoris, Paramètres'], ['Échap', 'Fermer la fenêtre ouverte']];
  return `<div class="panel"><h2>${icon('volume')} Raccourcis clavier</h2><table class="keys">${l.map(([k, t]) => `<tr><td><kbd>${k}</kbd></td><td>${t}</td></tr>`).join('')}</table></div>`;
}

function sauvegardes(d, state) {
  const b = d.lastBackup;
  return `<div class="panel"><h2>${icon('save')} Sauvegardes locales <span class="chip">${state.games.length} jeu(x)</span></h2>
    <p class="muted" style="margin-bottom:14px">Copie la bibliothèque (jeux, dossiers, sessions, réglages) dans un fichier JSON daté.</p>
    ${chemin('backupDir', d, 'Emplacement des sauvegardes')}
    <div class="stat">${b ? `<small>Dernière sauvegarde</small><b style="font-size:16px">${new Date(b.date).toLocaleDateString('fr-FR')} ${heureFr(b.date)} • ${taille(b.size)}</b><div class="mono muted" style="word-break:break-all">${esc(b.path)}</div>` : '<small>Aucune sauvegarde effectuée</small>'}</div>
    <div class="row" style="margin-top:14px"><button class="btn primary" data-action="createBackup">${icon('save', 15)} Créer une sauvegarde</button>
      <button class="btn" data-action="openBackup">${icon('folder', 15)} Ouvrir le dossier</button></div></div>`;
}

export function renderSettings(state, ui) {
  const d = ui.draft || state.settings;
  const corps = { general, display: affichage, pads: manettes, keys: raccourcis }[ui.settingsTab]?.(d) || sauvegardes(d, state);
  return `<div class="page-head"><div><div class="eyebrow">Configuration • Système nominal • Sandbox locale</div><h1>Paramètres du Hub</h1>
      <p>Personnalisez le comportement du launcher, les répertoires, l'affichage et les périphériques.</p></div>
      <div class="row"><button class="btn" data-action="resetSettings">${icon('refresh', 15)} Restaurer par défaut</button>
        <button class="btn primary" data-action="saveSettings">${icon('check', 15)} Enregistrer les modifications</button></div></div>
    <div class="tabs" style="margin-bottom:20px">${TABS.map(([id, l, i]) => `<button class="tab ${ui.settingsTab === id ? 'active' : ''}" data-action="settingsTab" data-id="${id}">${icon(i, 15)} ${l}</button>`).join('')}</div>
    ${corps}`;
}
````

---

## `src/js/services/api.js`

````javascript
/** api.js — Appels vers le processus principal (via le pont du preload). */
export const api = (canal, ...args) => window.angels.invoke(canal, ...args);
export const ecouter = (canal, cb) => window.angels.on(canal, cb);
````

---

## `src/js/services/format.js`

````javascript
/** format.js — Utilitaires de mise en forme (échappement HTML, durées, tailles, dates, jaquettes). */

/** Échappe le HTML : à utiliser sur TOUTE donnée utilisateur injectée dans un gabarit. */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const heures = sec => Math.floor((sec || 0) / 3600) + 'h';

/** 8040 s → « 2h 14m » */
export function duree(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

/** Tailles en unités françaises (Mo, Go, To). */
export function taille(octets) {
  if (!octets) return '—';
  const go = octets / 1e9;
  if (go >= 1000) return (go / 1000).toFixed(2).replace('.', ',') + ' To';
  if (go >= 1) return go.toFixed(1).replace('.', ',') + ' Go';
  return Math.round(octets / 1e6) + ' Mo';
}

/** Date relative : Aujourd'hui, Hier, Il y a N jours… */
export function relatif(ts) {
  if (!ts) return 'Jamais';
  const j = Math.floor((Date.now() - ts) / 86400000);
  if (j <= 0) return "Aujourd'hui";
  if (j === 1) return 'Hier';
  if (j < 30) return `Il y a ${j} jours`;
  return new Date(ts).toLocaleDateString('fr-FR');
}
export const dateFr = ts => ts ? new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';
export const heureFr = ts => new Date(ts).toLocaleTimeString('fr-FR');

/** Teinte stable (0-359) calculée depuis le nom du jeu, pour les jaquettes générées. */
export function teinte(nom) {
  let h = 0; for (const c of String(nom)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

/** Chemin de fichier local → URL file:// utilisable dans le CSS. */
export const fileUrl = p => 'file:///' + encodeURI(String(p).replace(/\\/g, '/').replace(/^\//, '')).replace(/'/g, '%27');

/** Style CSS de la jaquette : image choisie, sinon dégradé généré. */
export function coverStyle(jeu) {
  if (jeu.cover) return `background-image:url('${fileUrl(jeu.cover)}')`;
  const h = teinte(jeu.name);
  return `background-image:linear-gradient(160deg,hsl(${h} 55% 28%),hsl(${(h + 60) % 360} 60% 14%))`;
}
export const initiale = jeu => esc((jeu.name || '?').trim().charAt(0).toUpperCase());
````

---

## `src/js/services/icons.js`

````javascript
/** icons.js — Petit jeu d'icônes SVG intégrées (l'application fonctionne 100 % hors-ligne). */
const P = {
  library: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  disk: '<rect x="2" y="14" width="20" height="7" rx="2"/><path d="M5 14l2.5-9h9L19 14"/><path d="M6 17.5h.01"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  play: '<path d="M6 4l14 8-14 8z"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 14 4l2-2"/><path d="M20 20v-5h-5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  gamepad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5M16 11h.01M18.5 14h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8"/>',
  power: '<path d="M12 3v9"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  volume: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8a5 5 0 0 1 0 8"/>'
};

/** Renvoie le SVG d'une icône ; `taille` en pixels. */
export const icon = (nom, taille = 18) =>
  `<svg class="ico${nom === 'play' ? ' fill' : ''}" viewBox="0 0 24 24" width="${taille}" height="${taille}" aria-hidden="true">${P[nom] || ''}</svg>`;
````

---

## `src/js/services/selectors.js`

````javascript
/** selectors.js — Recherche, tri et regroupements sur la liste de jeux. */

/** Minuscules + suppression des accents, pour une recherche tolérante. */
export const normaliser = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function rechercher(jeux, q) {
  const n = normaliser(q).trim();
  return n ? jeux.filter(g => normaliser(`${g.name} ${g.subtitle} ${g.exePath}`).includes(n)) : jeux;
}

/** Modes : recent | name | playtime | added */
export function trier(jeux, mode) {
  const c = {
    recent: (a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0),
    name: (a, b) => a.name.localeCompare(b.name, 'fr'),
    playtime: (a, b) => b.playtime - a.playtime,
    added: (a, b) => b.addedAt - a.addedAt
  }[mode] || (() => 0);
  return [...jeux].sort(c);
}

/** Dossier surveillé qui contient le jeu (ou undefined). */
export const dossierDuJeu = (state, g) => state.folders.find(f => g.exePath.startsWith(f.path));

/** Jeu mis en avant : dernier jeu joué, sinon le premier de la liste. */
export const jeuMisEnAvant = jeux => trier(jeux, 'recent')[0] || null;

export const tempsTotal = jeux => jeux.reduce((s, g) => s + g.playtime, 0);
````

---

## `src/styles/components.css`

````css
/* components.css — Boutons, cartes de jeu, puces, interrupteurs, modales, toasts */

/* ---------- Boutons ---------- */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 0 18px;
  border-radius: var(--r); background: var(--card); border: 1px solid var(--line); font-weight: 600; transition: .15s; }
.btn:hover { border-color: var(--violet); background: var(--line); }
.btn.primary { background: var(--accent); color: var(--accent-ink); border-color: transparent; font: 700 13px var(--font-head);
  letter-spacing: .06em; text-transform: uppercase; box-shadow: 0 0 20px rgba(76, 215, 246, .25); }
.btn.primary:hover { transform: scale(1.02); filter: brightness(1.08); }
.btn.xl { min-height: 48px; padding: 0 32px; }
.btn.danger:hover { border-color: var(--danger); color: var(--danger); }
.btn.sm { min-height: 32px; padding: 0 12px; font-size: 12px; }
.icon-btn { width: 36px; height: 36px; display: grid; place-items: center; border-radius: var(--r); color: var(--muted); }
.icon-btn:hover { background: var(--panel); color: var(--text); }

/* ---------- Puces, badges, onglets ---------- */
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: var(--r);
  background: var(--panel); border: 1px solid var(--line); color: var(--muted); font: 500 11px var(--font-mono); letter-spacing: .04em; white-space: nowrap; }
button.chip:hover { color: var(--text); }
.chip.active { background: var(--accent); color: var(--accent-ink); border-color: transparent; font-weight: 700; }
.chip.ok { color: var(--green); border-color: var(--green); background: rgba(16, 185, 129, .15); }
.chip.info { color: var(--cyan); border-color: var(--cyan); background: rgba(6, 182, 212, .15); }
.tabs { display: inline-flex; gap: 4px; padding: 4px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--r); flex-wrap: wrap; }
.tab { padding: 6px 14px; border-radius: 6px; color: var(--muted); font-weight: 600; display: inline-flex; gap: 8px; align-items: center; }
.tab.active { background: var(--accent); color: var(--accent-ink); }
.tab:not(.active):hover { color: var(--text); background: var(--card); }

/* ---------- Panneaux ---------- */
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 20px; }
.panel h2 { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.panel h2 svg { color: var(--accent); }
.item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; margin-top: 8px;
  background: var(--card); border: 1px solid var(--line); border-radius: var(--r); text-align: left; width: 100%; }
button.item:hover { border-color: var(--violet); }
.stat { padding: 12px 14px; background: var(--card); border: 1px solid var(--line); border-radius: var(--r); }
.stat small { color: var(--muted); display: block; } .stat b { font: 700 22px var(--font-head); }
.bar { height: 8px; border-radius: 9999px; background: var(--line); overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--accent); border-radius: inherit; }
.bar.violet i { background: var(--violet); }
.log { font: 500 12px var(--font-mono); padding: 10px 12px; background: var(--bg); border-radius: var(--r); margin-top: 8px; display: flex; gap: 12px; }

/* ---------- Héros ---------- */
.hero { position: relative; min-height: 340px; border-radius: var(--r-xl); overflow: hidden; margin-bottom: 24px;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 14px; padding: 36px; background-size: cover; background-position: center; border: 1px solid var(--line); }
.hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, var(--bg) 8%, rgba(13, 17, 23, .55) 60%, rgba(13, 17, 23, .2)); }
.hero > * { position: relative; }
.hero h1 { font-size: 52px; line-height: 56px; text-transform: uppercase; }
.hero .sub { color: var(--accent); font: 600 24px var(--font-head); text-transform: uppercase; }

/* ---------- Cartes de jeu (2:3) ---------- */
.card { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08), 0 8px 24px rgba(0, 0, 0, .45); transition: transform .25s cubic-bezier(.34, 1.56, .64, 1), box-shadow .25s; }
.card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px -4px rgba(139, 92, 246, .25), 0 0 0 1px rgba(139, 92, 246, .5); }
.cover { aspect-ratio: 2 / 3; background-size: cover; background-position: center; display: flex; align-items: flex-end; position: relative; }
.cover .initial { position: absolute; inset: 0; display: grid; place-items: center; font: 700 64px var(--font-head); color: rgba(255, 255, 255, .25); }
.cover::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(13, 17, 23, .92) 0%, transparent 45%); }
.cover-info { position: relative; z-index: 1; padding: 12px; width: 100%; }
.cover-info h3 { font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cover-info .path { font: 500 10px var(--font-mono); color: var(--accent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.badge { position: absolute; top: 8px; left: 8px; z-index: 2; padding: 2px 8px; border-radius: 6px; font: 500 10px var(--font-mono); letter-spacing: .05em; text-transform: uppercase;
  background: rgba(16, 185, 129, .2); border: 1px solid var(--green); color: var(--green); }
.badge.off { background: rgba(13, 17, 23, .7); border-color: var(--line); color: var(--muted); }
.badge.run { background: rgba(6, 182, 212, .2); border-color: var(--cyan); color: var(--cyan); }
.card-actions { position: absolute; top: 8px; right: 8px; z-index: 2; display: flex; gap: 6px; }
.card-actions .icon-btn { width: 30px; height: 30px; background: rgba(13, 17, 23, .7); border-radius: 9999px; color: #fff; }
.card-actions .icon-btn.on { color: #ff9aa8; }
.card-actions .hov { opacity: 0; } .card:hover .hov { opacity: 1; }
.play-overlay { position: absolute; inset: 0; z-index: 2; display: grid; place-items: center; opacity: 0; transition: .2s; }
.card:hover .play-overlay { opacity: 1; }
.play-overlay button { width: 60px; height: 60px; border-radius: 9999px; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; box-shadow: 0 0 24px rgba(76, 215, 246, .5); }
.meta { display: flex; justify-content: space-between; gap: 6px; font: 500 11px var(--font-mono); color: var(--muted); margin-top: 4px; }
.meta b { color: var(--accent); font-weight: 500; }

/* Ligne de liste (Récemment ajoutés) */
.game-row { display: flex; align-items: center; gap: 16px; padding: 12px; margin-bottom: 10px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--r-lg); }
.thumb { width: 56px; height: 72px; border-radius: var(--r); background-size: cover; background-position: center; flex: none; }
.game-row .info { flex: 1; min-width: 0; } .game-row .info h3 { font-size: 18px; }
.game-row .info .mono { color: var(--muted); display: flex; gap: 14px; flex-wrap: wrap; }

/* Dossier / disque */
.disk { padding: 20px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--r-lg); }
.disk h3 { font: 700 20px var(--font-head); margin-bottom: 2px; }
.folder { padding: 16px; margin-bottom: 14px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--r-lg); cursor: pointer; }
.folder.sel { background: var(--card); border-color: rgba(76, 215, 246, .45); }
.folder .path { font: 500 11px var(--font-mono); color: var(--muted); word-break: break-all; }

/* ---------- Formulaires ---------- */
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.field label { font-weight: 700; }
.input { height: 40px; padding: 0 12px; background: var(--bg); border: 1px solid var(--line); border-radius: var(--r); outline: 0; min-width: 0; flex: 1; }
.input:focus { border-color: var(--cyan); box-shadow: 0 0 0 2px rgba(6, 182, 212, .25); }
select.input { cursor: pointer; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px; margin-bottom: 10px; background: var(--card); border-radius: var(--r-lg); }
.toggle-row p { color: var(--muted); font-size: 12px; margin-top: 2px; }
.toggle { width: 48px; height: 26px; border-radius: 9999px; background: var(--dim); position: relative; flex: none; transition: .2s; }
.toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 9999px; background: #fff; transition: .2s; }
.toggle.on { background: var(--accent); } .toggle.on::after { left: 25px; background: var(--accent-ink); }
.swatch { width: 34px; height: 34px; border-radius: 9999px; border: 2px solid transparent; }
.swatch.sel { border-color: #fff; }
table.keys { width: 100%; border-collapse: collapse; } table.keys td { padding: 10px 8px; border-bottom: 1px solid var(--line); }
kbd { font: 500 12px var(--font-mono); padding: 2px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--card); }

/* ---------- Modale & toasts ---------- */
.modal-bg { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; background: rgba(0, 0, 0, .55); backdrop-filter: blur(6px); }
.modal { width: min(520px, 92vw); padding: 24px; background: rgba(22, 27, 34, .95); border: 1px solid rgba(255, 255, 255, .1); border-radius: var(--r-xl); }
.modal h2 { margin-bottom: 16px; } .modal .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.err { color: var(--danger); min-height: 18px; font-size: 12px; margin-bottom: 6px; }
#toast-root { position: fixed; right: 20px; bottom: 20px; z-index: 60; display: flex; flex-direction: column; gap: 8px; }
.toast { padding: 12px 16px; background: var(--card); border: 1px solid var(--line); border-left: 3px solid var(--accent); border-radius: var(--r); box-shadow: 0 8px 24px rgba(0, 0, 0, .5); }
.toast.error { border-left-color: var(--danger); } .toast.success { border-left-color: var(--green); }
.empty { text-align: center; padding: 56px 20px; color: var(--muted); border: 1px dashed var(--line); border-radius: var(--r-lg); }
.empty h2 { color: var(--text); margin-bottom: 8px; }
.meta span { display: inline-flex; align-items: center; gap: 4px; }

/* Recherche de pochette en cours : pulsation discrète de la jaquette */
.cover.searching { animation: pulse 1.2s ease-in-out infinite; }
.cover.searching::before { content: 'Recherche…'; position: absolute; top: 40%; left: 0; right: 0; text-align: center; z-index: 1; font: 500 11px var(--font-mono); color: var(--accent); }
@keyframes pulse { 50% { filter: brightness(1.35); } }
.result { text-align: left; }
.result small { color: var(--muted); font-family: var(--font-mono); }
````

---

## `src/styles/layout.css`

````css
/* layout.css — Structure générale : sidebar, topbar, zone de contenu, grilles */
#app { display: grid; grid-template-columns: 240px 1fr; grid-template-rows: 64px 1fr; height: 100vh; }

/* ---------- Barre latérale ---------- */
#sidebar { grid-row: 1 / 3; background: var(--panel); border-right: 1px solid var(--line);
  display: flex; flex-direction: column; padding: 16px 12px; gap: 4px; }
.brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 18px; }
.brand-logo { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center;
  background: linear-gradient(135deg, var(--violet), var(--cyan)); color: #fff; font: 700 18px var(--font-head); }
.brand b { font: 700 18px var(--font-head); display: block; line-height: 18px; }
.brand small { font: 500 10px var(--font-mono); color: var(--accent); letter-spacing: .08em; }
.nav-title { font: 500 10px var(--font-mono); letter-spacing: .12em; color: var(--muted); padding: 14px 10px 6px; text-transform: uppercase; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--r);
  color: var(--muted); font-weight: 600; width: 100%; text-align: left; border-left: 3px solid transparent; }
.nav-item:hover { background: var(--card); color: var(--text); }
.nav-item.active { color: var(--text); background: rgba(139, 92, 246, .16); border-left-color: var(--accent); }
.profile { margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--card); border-radius: var(--r-lg); }
.avatar { width: 34px; height: 34px; border-radius: 9999px; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; flex: none; }
.profile b { display: block; line-height: 16px; } .profile small { color: var(--green); font: 500 11px var(--font-mono); }

/* ---------- Barre supérieure ---------- */
#topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 var(--pad);
  background: rgba(13, 17, 23, .85); backdrop-filter: blur(16px); border-bottom: 1px solid var(--line); }
.search { display: flex; align-items: center; gap: 10px; width: min(460px, 45%); padding: 0 14px; height: 40px;
  background: var(--panel); border: 1px solid var(--line); border-radius: var(--r); color: var(--muted); }
.search:focus-within { border-color: var(--cyan); box-shadow: 0 0 0 2px rgba(6, 182, 212, .25); color: var(--text); }
.search input { flex: 1; background: none; border: 0; outline: 0; min-width: 0; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.divider { width: 1px; height: 24px; background: var(--line); }
.user-name { font: 700 14px var(--font-head); }

/* ---------- Contenu ---------- */
#view { overflow-y: auto; padding: var(--pad); }
.page-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
.page-head p { color: var(--muted); max-width: 640px; margin-top: 6px; }
.eyebrow { font: 500 11px var(--font-mono); letter-spacing: .1em; color: var(--accent); text-transform: uppercase; margin-bottom: 6px; }
.cols { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
.stack { display: flex; flex-direction: column; gap: 20px; }
.row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.row.between { justify-content: space-between; }
.grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }

/* Rail d'icônes sur petites fenêtres */
@media (max-width: 1100px) {
  #app { grid-template-columns: 72px 1fr; }
  .nav-item span, .nav-title, .brand div, .profile div { display: none; }
  .nav-item { justify-content: center; padding: 12px; }
  .cols { grid-template-columns: 1fr; }
}
````

---

## `src/styles/theme.css`

````css
/* theme.css — Jetons de design (DESIGN.md « Aether Launch ») et styles de base */
:root {
  --bg: #0D1117;          /* canevas */
  --panel: #161B22;       /* barre latérale / barre d'outils */
  --card: #21262D;        /* cartes flottantes */
  --line: #30363D;        /* bordures */
  --text: #F0F6FC;
  --muted: #8B949E;
  --dim: #484F58;
  --violet: #8B5CF6;
  --cyan: #06B6D4;
  --green: #10B981;
  --danger: #ffb4ab;
  --accent: #4cd7f6;      /* couleur d'action principale (modifiable dans Paramètres) */
  --accent-ink: #003640;  /* texte posé sur --accent */
  --r: .5rem; --r-lg: 1rem; --r-xl: 1.5rem;
  --font-head: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
  --font-body: 'Manrope', 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  --pad: 2rem;
}
/* Variantes d'accent */
[data-accent="violet"]  { --accent: #a078ff; --accent-ink: #23005c; }
[data-accent="emerald"] { --accent: #4edea3; --accent-ink: #002113; }
/* Densité */
[data-density="compact"] { --pad: 1.1rem; }

* { box-sizing: border-box; margin: 0; }
html, body { height: 100%; }
body {
  background: var(--bg); color: var(--text);
  font: 400 14px/20px var(--font-body); overflow: hidden;
}
h1, h2, h3 { font-family: var(--font-head); letter-spacing: -.02em; }
h1 { font-size: 36px; line-height: 44px; font-weight: 700; }
h2 { font-size: 20px; line-height: 28px; font-weight: 600; }
h3 { font-size: 16px; font-weight: 600; }
button { font: inherit; color: inherit; cursor: pointer; background: none; border: 0; }
input, select { font: inherit; color: inherit; }
.mono { font-family: var(--font-mono); font-size: 12px; letter-spacing: .04em; }
.muted { color: var(--muted); }
.accent { color: var(--accent); }
.green { color: var(--green); }
svg.ico { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; flex: none; }
svg.ico.fill { fill: currentColor; stroke: none; }
::-webkit-scrollbar { width: 10px; } ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 8px; }
````

---

## `tests/smoke.test.js`

````javascript
/**
 * smoke.test.js — Test rapide des services principaux (sans Electron) : node tests/smoke.test.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { Storage } = require('../main/services/storage');
const { scanFolder } = require('../main/services/scanner');
const { listDisks } = require('../main/services/disks');
const lib = require('../main/library');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'angels-'));
const ext = process.platform === 'win32' ? '.exe' : '.sh';

// Faux dossier de jeux : 2 jeux + 1 désinstalleur à ignorer
fs.mkdirSync(path.join(tmp, 'jeux', 'Alpha', 'bin'), { recursive: true });
fs.mkdirSync(path.join(tmp, 'jeux', 'Beta'), { recursive: true });
fs.writeFileSync(path.join(tmp, 'jeux', 'Alpha', 'bin', 'alpha' + ext), 'x'.repeat(500));
fs.writeFileSync(path.join(tmp, 'jeux', 'Alpha', 'unins000' + ext), 'x');
fs.writeFileSync(path.join(tmp, 'jeux', 'Beta', 'beta' + ext), 'x'.repeat(100));

const st = new Storage(path.join(tmp, 'data')); st.load();

assert.strictEqual(scanFolder(path.join(tmp, 'jeux')).length, 2, 'le scan doit trouver 2 jeux');

const f = { id: 'f1', name: 'jeux', path: path.join(tmp, 'jeux') };
st.data.folders.push(f);
assert.strictEqual(lib.scanOne(st, f), 2, 'ajout de 2 jeux');
assert.strictEqual(lib.scanOne(st, f), 0, 'pas de doublon au second scan');

const r = lib.addGame(st, { name: 'Manuel', exePath: '/x/manuel.exe' });
assert.ok(r.ok && lib.addGame(st, { name: 'Manuel', exePath: '/x/manuel.exe' }).ok === false, 'doublon refusé');
assert.strictEqual(lib.addGame(st, { name: '', exePath: '/y' }).ok, false, 'nom obligatoire');

lib.recordSession(st, r.game.id, 3600, Date.now());
assert.strictEqual(st.data.games.find(g => g.id === r.game.id).playtime, 3600);
assert.ok(lib.removeGame(st, r.game.id).ok);

st.flush();
const st2 = new Storage(path.join(tmp, 'data')); st2.load();
assert.strictEqual(st2.data.games.length, 2, 'persistance sur disque');

assert.ok(Array.isArray(listDisks()));
// ---------- Pochettes (réseau simulé) ----------
const covers = require('../main/services/covers');
(async () => {
  assert.strictEqual(covers.nettoyerNom('BaldursGate3_v1.2.0'), 'Baldurs Gate 3', 'nettoyage du nom de dossier');
  assert.strictEqual(covers.nettoyerNom('Hades II'), 'Hades II', 'un nom normal reste intact');
  const res = [{ appid: 2, name: 'ELDEN RING Soundtrack' }, { appid: 1, name: 'ELDEN RING' }];
  assert.strictEqual(covers.meilleureCorrespondance('Elden Ring', res).appid, 1, 'bande-son écartée');
  assert.strictEqual(covers.meilleureCorrespondance('Baldurs Gate 3', [{ appid: 9, name: "Baldur's Gate 3" }]).appid, 9, 'apostrophes ignorées');
  assert.strictEqual(covers.meilleureCorrespondance('Zzz', [{ appid: 1, name: 'Totalement autre chose' }]), null, 'pas de faux positif');

  const json = o => ({ ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => o });
  const image = n => ({ ok: true, status: 200, headers: { get: () => 'image/jpeg' }, arrayBuffer: async () => new Uint8Array(n).buffer });
  const faux = routes => async url => { for (const [m, rep] of routes) if (url.includes(m)) return rep(url); throw new Error('hors-ligne'); };
  const dir = path.join(tmp, 'data2'); const s3 = new Storage(dir); s3.load();
  const g1 = lib.addGame(s3, { name: 'Elden Ring', exePath: '/a/er.exe' }).game;
  const g2 = lib.addGame(s3, { name: 'Jeu Inconnu XYZ', exePath: '/a/x.exe' }).game;

  // 1) trouvé + téléchargé
  covers.init({ storage: s3, fetchImpl: faux([['storesearch', () => json({ items: [{ id: 1245620, type: 'app', name: 'ELDEN RING' }] })], ['/1245620/library_600x900.jpg', () => image(5000)]]) });
  let r = await covers.auto(g1.id);
  assert.ok(r.ok && fs.existsSync(g1.cover) && g1.coverSource === 'steam', 'pochette téléchargée');
  const ancien = g1.cover;
  // 2) repli sur header.jpg quand la pochette verticale n'existe pas
  covers.init({ storage: s3, fetchImpl: faux([['storesearch', () => json({ items: [{ id: 5, type: 'app', name: 'ELDEN RING' }] })], ['/5/header.jpg', () => image(4000)]]) });
  r = await covers.auto(g1.id);
  assert.ok(r.ok && !fs.existsSync(ancien), 'ancienne image supprimée au remplacement');
  // 3) introuvable → date de vérification enregistrée
  covers.init({ storage: s3, fetchImpl: faux([['storesearch', () => json({ items: [] })]]) });
  r = await covers.auto(g2.id);
  assert.ok(!r.ok && g2.coverCheckedAt, 'introuvable mémorisé');
  // 4) hors-ligne → erreur réseau, rien de mémorisé (nouvel essai possible)
  const g3 = lib.addGame(s3, { name: 'Autre', exePath: '/a/o.exe' }).game;
  covers.init({ storage: s3, fetchImpl: faux([]) });
  await assert.rejects(() => covers.auto(g3.id), e => e.reseau === true);
  assert.ok(!g3.coverCheckedAt, 'hors-ligne ne marque pas le jeu comme vérifié');
  // 5) retrait : plus de recherche automatique pour ce jeu
  covers.retirer(g1.id);
  assert.ok(g1.cover === null && g1.coverSource === 'none');
  assert.strictEqual(covers.rechercherManquantes({ force: true }).queued, 2, 'g1 (retirée) exclue, g2+g3 éligibles');

  console.log('✔ Tous les tests passent');
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
})().catch(e => { console.error('✘', e); process.exit(1); });
````
