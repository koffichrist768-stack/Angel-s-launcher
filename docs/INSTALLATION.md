# Installation

## Installation automatique (recommandée)

| Système | Installer | Lancer |
|---|---|---|
| **Windows** | double-clic sur `installer.bat` | raccourci **Angels Launcher** (Bureau / menu Démarrer) ou `lancer.bat` |
| **Linux / macOS** | `./install.sh` | `./lancer.sh` (Linux : aussi via le menu des applications) |

Le script vérifie Node.js 22.12+ (l'installe via `winget` sous Windows si absent), exécute `npm install`, crée les raccourcis,
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

## Créer le Setup.exe (workflow)

Deux façons de produire l'installateur Windows classique (assistant, choix du dossier, raccourcis, désinstallation) :

**1) En local (PC Windows avec Node.js 22.12+)** — double-clic sur `build-setup.bat` (ou `npm run dist:win`). Il installe les dépendances,
lance les tests, puis génère dans `dist/` :
- `Angels-Launcher-Setup-x.y.z.exe` : l'installateur ;
- `Angels-Launcher-Portable-x.y.z.exe` : version portable, sans installation.

Si l'erreur mentionne des liens symboliques, activez le « Mode développeur » de Windows ou lancez le script en administrateur.

**2) Sur GitHub (workflow `.github/workflows/build-setup.yml`)** — aucun outil à installer sur votre PC :
1. poussez le projet sur un dépôt GitHub ;
2. mettez à jour `"version"` dans `package.json`, puis : `git tag v1.2.0` et `git push origin v1.2.0` ;
3. GitHub exécute les tests (Linux), construit le Setup sur Windows et l'attache à la **Release** `v1.2.0` ;
4. sans tag : onglet **Actions › Construire le Setup Windows › Run workflow**, les fichiers sont dans **Artifacts**.

Le tag doit correspondre à la version de `package.json` (sinon le workflow s'arrête). Le Setup n'est pas signé : Windows SmartScreen
peut afficher « éditeur inconnu » (Informations complémentaires › Exécuter quand même). Pour signer, voir les secrets `CSC_LINK` /
`CSC_KEY_PASSWORD` en commentaire dans le workflow. Vos données (`%APPDATA%\angels-launcher`) ne sont pas supprimées à la désinstallation.

## Installation manuelle

## Prérequis
- **Node.js 22.12 ou supérieur** (exigé par Electron 45) (avec npm) — https://nodejs.org
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
