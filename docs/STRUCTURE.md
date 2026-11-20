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
│       ├── covers.js         Pochettes : SteamGridDB + Steam, appariement du nom, téléchargement, file d'attente
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
