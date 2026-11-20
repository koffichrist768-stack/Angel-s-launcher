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
| **Pochettes** : image locale au choix, ou **recherche automatique en ligne** (SteamGridDB, puis Steam) pour chaque jeu, avec choix manuel du jeu et de la pochette | Carte (survol) › icône image, bouton « Pochette » |
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

Pour obtenir un vrai **Setup.exe** : `build-setup.bat` (local) ou le workflow GitHub Actions `.github/workflows/build-setup.yml`
(voir [docs/INSTALLATION.md](docs/INSTALLATION.md#créer-le-setupexe-workflow)).

Voir [docs/INSTALLATION.md](docs/INSTALLATION.md), [docs/GUIDE_UTILISATEUR.md](docs/GUIDE_UTILISATEUR.md),
[docs/GUIDE_MANIPULATIONS.md](docs/GUIDE_MANIPULATIONS.md) (clé API, Setup.exe, GitHub, dépannage)
et [docs/STRUCTURE.md](docs/STRUCTURE.md).

## Pochettes : fonctionnement et confidentialité

- **Automatique** : à l'ajout d'un jeu, après un scan et au démarrage, les jeux sans pochette sont recherchés d'abord sur
  **SteamGridDB** (si une clé API gratuite est saisie dans Paramètres › Services en ligne : meilleure pochette verticale 600×900 selon les votes),
  puis sur le magasin **Steam** (API publique, sans clé). Le nom du dossier est nettoyé (`BaldursGate3_v1.2` → « Baldurs Gate 3 »),
  le résultat le plus proche est retenu (les bandes-son/DLC sont écartés) ; côté Steam, à défaut de pochette verticale, l'image d'en-tête est utilisée.
- **Manuel** : icône image au survol d'une carte ou bouton « Pochette » du héros → onglet **SteamGridDB** (choisir le jeu puis la pochette
  parmi des vignettes) ou **Steam** (choisir le bon titre),
  importer une **image locale**, relancer la recherche automatique ou **retirer** la pochette (plus aucune recherche automatique pour ce jeu).
- **Confidentialité** : seuls le nom du jeu et les requêtes d'image partent vers SteamGridDB / Steam (la clé API reste dans le fichier de
  données local ; elle figure aussi dans les sauvegardes JSON). Les vignettes du sélecteur sont chargées depuis `*.steamgriddb.com` (CSP). Réglage **Paramètres › Général › Recherche
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
