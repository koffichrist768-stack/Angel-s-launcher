# Guide des manipulations — Angel's Launcher

Ce guide détaille pas à pas les opérations un peu techniques : clé API SteamGridDB, recherche de pochettes,
création du fichier **Setup.exe**, publication sur GitHub, installation et dépannage.

**Sommaire**
1. [La clé API SteamGridDB](#1-la-clé-api-steamgriddb)
2. [Chercher une pochette](#2-chercher-une-pochette)
3. [Créer le Setup.exe sur votre PC](#3-créer-le-setupexe-sur-votre-pc)
4. [Créer le Setup.exe avec GitHub (workflow)](#4-créer-le-setupexe-avec-github-workflow)
5. [Installer et désinstaller](#5-installer-et-désinstaller)
6. [Données, sauvegardes et confidentialité](#6-données-sauvegardes-et-confidentialité)
7. [Dépannage](#7-dépannage)

---

## 1. La clé API SteamGridDB

**À quoi ça sert ?** SteamGridDB héberge de très nombreuses pochettes de jeux (choisies et notées par la communauté).
Son API exige une clé personnelle et gratuite. Sans clé, le launcher fonctionne quand même (pochettes Steam, images locales).

### 1.1 Obtenir la clé
1. Ouvrez **Paramètres › Services en ligne** et cliquez sur **Obtenir une clé** (ou allez sur
   https://www.steamgriddb.com/profile/preferences/api).
2. Connectez-vous (ou créez un compte) sur SteamGridDB.
3. Sur la page « API » de vos préférences, **copiez** la clé (une longue suite de lettres et de chiffres).
   Ne la partagez pas : elle est liée à votre compte.

### 1.2 La saisir dans le launcher
**Méthode A — Paramètres**
1. **Paramètres › Services en ligne**.
2. Collez la clé dans le champ (bouton **Afficher** pour vérifier ce que vous avez collé).
3. Cliquez sur **Tester la clé** : un message vert « Clé valide » confirme qu'elle fonctionne.
4. Cliquez sur **Enregistrer**. L'étiquette passe à « Clé enregistrée ».

**Méthode B — Directement depuis la fenêtre « Pochette »**
1. Survolez une carte de jeu, cliquez sur l'icône image (ou sur « Pochette » dans le héros).
2. Onglet **SteamGridDB** : collez la clé dans le champ proposé puis cliquez sur **Enregistrer**.
   La clé est testée avant d'être enregistrée ; en cas de refus, un message d'erreur s'affiche.

### 1.3 Modifier, effacer, tester à nouveau
- **Modifier** : remplacez la clé dans le champ, testez, puis **Enregistrer**.
- **Effacer** : bouton **Effacer**, puis **Enregistrer** pour confirmer (sans enregistrement, rien ne change).
- **Tester** : le bouton « Tester la clé » vérifie ce qui est écrit dans le champ, même avant l'enregistrement.

> Le bouton « Enregistrer les modifications » en haut de la page Paramètres enregistre aussi la clé.
> Si vous quittez la page sans enregistrer, les modifications sont perdues.

---

## 2. Chercher une pochette

Ouvrez la fenêtre **Pochette** d'un jeu (icône image au survol d'une carte, ou bouton « Pochette »).

### 2.1 Avec SteamGridDB (clé requise)
1. Onglet **SteamGridDB**, vérifiez le nom du jeu dans le champ (corrigez-le si besoin, ex. « Hades II »), cliquez sur **Chercher**.
2. Cliquez sur **le bon jeu** dans la liste.
3. Des **vignettes verticales** s'affichent, les mieux notées en premier. Cliquez sur celle que vous voulez : elle est téléchargée et
   appliquée. **← Résultats** revient à la liste des jeux.

### 2.2 Avec Steam (sans clé)
Onglet **Steam** : cherchez, puis cliquez sur le bon titre. L'image verticale 600×900 est utilisée (à défaut, l'image d'en-tête).

### 2.3 Sans clé SteamGridDB : récupérer une image à la main
1. Dans l'onglet SteamGridDB, cliquez sur **Ouvrir SteamGridDB** : le site s'ouvre dans votre navigateur.
2. Trouvez le jeu, choisissez une pochette, **enregistrez l'image** sur votre PC (clic droit › Enregistrer l'image sous…).
3. Revenez au launcher : **Image locale…** puis sélectionnez le fichier (png, jpg, webp, gif).

### 2.4 Recherche automatique
- **Pour un jeu** : bouton **Recherche automatique** dans la fenêtre Pochette.
- **Pour tous les jeux sans pochette** : **Rechercher les pochettes manquantes** dans « Accès rapide » de la bibliothèque.
- **En arrière-plan** : Paramètres › Général › « Recherche automatique des pochettes » (activée par défaut).
- Ordre de recherche : SteamGridDB d'abord (si une clé est enregistrée), puis Steam.
- Un jeu introuvable n'est re-cherché automatiquement qu'après 7 jours ; **Retirer** une pochette interdit toute recherche automatique
  pour ce jeu (vous pouvez toujours en choisir une à la main).

---

## 3. Créer le Setup.exe sur votre PC

Un **Setup.exe** est l'installateur classique : l'utilisateur double-clique, choisit le dossier, et obtient des raccourcis.
Il se construit **sous Windows**.

### 3.1 Prérequis (une seule fois)
1. Installez **Node.js LTS** (version **22.12 ou plus** : Electron 45 refuse les versions plus anciennes, comme Node 20) depuis https://nodejs.org — laissez les options par défaut.
2. Vérifiez : ouvrez l'**Invite de commandes** et tapez `node -v` ; un numéro de version doit s'afficher.
3. Activez le **Mode développeur** de Windows (Paramètres › « Pour les développeurs », selon la version de Windows) : sans lui, la
   construction peut échouer avec une erreur de « symlink » (liens symboliques). Alternative : lancer le script en administrateur.

### 3.2 Construire
1. Décompressez le projet (clic droit › Extraire tout) — ne travaillez pas depuis l'intérieur du zip.
2. Double-cliquez sur **`build-setup.bat`**. Il : installe les dépendances (téléchargement d'Electron, ~100 Mo), lance les tests,
   puis génère l'installateur. Comptez **2 à 5 minutes**.
3. Le dossier **`dist\`** s'ouvre avec :
   - `Angels-Launcher-Setup-x.y.z.exe` — l'**installateur** à distribuer ;
   - `Angels-Launcher-Portable-x.y.z.exe` — version **portable** (aucune installation, se lance directement).

Équivalent en ligne de commande : `npm ci` puis `npm run dist:win`.

### 3.3 Changer le numéro de version
Ouvrez `package.json` et modifiez `"version": "1.1.0"` (ex. `"1.2.0"`) **avant** de construire : le numéro apparaît dans le nom
du fichier. (L'ancien installateur par script `INSTALLER.bat` garde sa propre variable `$version` dans
`packaging/windows/Install-AngelsLauncher.ps1`.)

---

## 4. Créer le Setup.exe avec GitHub (workflow)

Le fichier `.github/workflows/build-setup.yml` fait la construction **sur les serveurs de GitHub** : rien à installer sur votre PC,
et le Setup est publié automatiquement.

### 4.1 Mettre le projet sur GitHub (une seule fois)
1. Créez un compte et un **nouveau dépôt** sur https://github.com (vide, sans README).
2. Dans le dossier du projet (Invite de commandes ou terminal, avec [Git](https://git-scm.com) installé) :
   ```bash
   git init
   git add .
   git commit -m "Angel's Launcher"
   git branch -M main
   git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-DEPOT.git
   git push -u origin main
   ```
   (Le fichier `.gitignore` exclut déjà `node_modules/` et `dist/`.)

### 4.2 Publier une version (Setup attaché à une « Release »)
1. Modifiez `"version"` dans `package.json` (ex. `1.2.0`), puis :
   ```bash
   git add package.json
   git commit -m "Version 1.2.0"
   git push
   git tag v1.2.0
   git push origin v1.2.0
   ```
2. Sur GitHub, onglet **Actions** : le workflow « Construire le Setup Windows » démarre (≈ 5 à 10 min).
3. Une fois terminé (✔ vert), onglet **Releases** (colonne de droite de la page du dépôt) : la version `v1.2.0` contient le
   Setup et la version portable à télécharger.

> Le **tag doit être identique à la version** de `package.json` (`v1.2.0` ↔ `1.2.0`), sinon le workflow s'arrête avec un message explicite.

### 4.3 Construire sans publier (essai)
Onglet **Actions** › **Construire le Setup Windows** › **Run workflow**. À la fin, ouvrez l'exécution : les fichiers sont dans la
section **Artifacts** (conservés 30 jours).

### 4.4 Si le workflow échoue
Cliquez sur l'exécution en rouge, puis sur l'étape qui a échoué : lisez le message. Cas fréquents : tests en échec (corrigez puis
repoussez), tag différent de la version, dépôt privé sans minutes Actions disponibles.

### 4.5 Signature du Setup (facultatif, avancé)
Sans signature, Windows SmartScreen affiche « Windows a protégé votre PC » à l'installation (voir §5). Pour l'éviter il faut un
certificat de signature de code (payant) : ajoutez-le en base64 dans **Settings › Secrets and variables › Actions** sous le nom
`CSC_LINK`, son mot de passe sous `CSC_KEY_PASSWORD`, puis suivez les commentaires dans le workflow.

---

## 5. Installer et désinstaller

### 5.1 Installer
1. Double-cliquez sur `Angels-Launcher-Setup-x.y.z.exe`.
2. Si **SmartScreen** affiche « Windows a protégé votre PC » : cliquez sur **Informations complémentaires**, puis **Exécuter quand même**
   (normal pour une application non signée).
3. Choisissez le dossier d'installation, validez : des raccourcis « Angels Launcher » sont créés sur le Bureau et dans le menu Démarrer.
   L'installation se fait pour l'utilisateur courant, sans droits administrateur.

### 5.2 Mettre à jour
Lancez simplement le nouveau Setup : il remplace l'ancienne version. Vos jeux, réglages et la clé API sont conservés.

### 5.3 Désinstaller
**Paramètres Windows › Applications › Applications installées › Angel's Launcher › Désinstaller.**
Vos données (`%APPDATA%\angels-launcher`) **ne sont pas supprimées** ; supprimez ce dossier à la main pour tout effacer.

---

## 6. Données, sauvegardes et confidentialité

- **Où sont mes données ?** `%APPDATA%\angels-launcher\` : `angels-data.json` (bibliothèque, réglages, clé API) et `covers\` (pochettes).
  Pour y accéder : touches Windows + R, tapez `%APPDATA%\angels-launcher`, Entrée.
- **Sauvegarde** : Paramètres › Sauvegardes locales › choisissez un dossier puis **Créer une sauvegarde** (copie JSON datée).
  **Attention : ce fichier contient votre clé API** — ne le partagez pas.
- **Restaurer** (manuel) : fermez le launcher, copiez le fichier de sauvegarde dans `%APPDATA%\angels-launcher\` en le renommant
  `angels-data.json`, puis relancez. Les images du dossier `covers\` doivent y être aussi.
- **Réseau** : seul le **nom du jeu** et les demandes d'image partent vers SteamGridDB / Steam. Pour rester 100 % hors-ligne,
  désactivez « Recherche automatique des pochettes » et n'utilisez pas les onglets en ligne.

---

## 7. Dépannage

| Problème | Cause probable | Solution |
|---|---|---|
| « Clé API SteamGridDB refusée » | Clé mal copiée (espace, caractère manquant) ou régénérée | Recopiez-la depuis la page API, **Tester la clé**, **Enregistrer** |
| « Clé API SteamGridDB manquante » | Aucune clé enregistrée | Paramètres › Services en ligne (§1.2) |
| « Connexion impossible » | Pas d'Internet, proxy ou pare-feu | Vérifiez la connexion ; réessayez plus tard |
| Aucun résultat pour un jeu | Nom trop différent du titre officiel | Corrigez le nom dans le champ de recherche (titre en anglais) |
| « Aucune pochette verticale » | Le jeu n'a que des bannières sur SteamGridDB | Essayez l'onglet Steam ou une image locale |
| Les icônes de survol n'apparaissent pas | Souris hors de la carte | Survolez la **jaquette** ; au clavier, naviguez avec Tab |
| `build-setup.bat` : erreur « symlink » | Droits Windows | Activez le Mode développeur ou lancez en administrateur (§3.1) |
| `npm warn EBADENGINE … required node >=22.12.0` puis `electron-builder n'est pas reconnu` | Node trop ancien (ex. 20) : l'installation des dépendances échoue | Installez Node LTS 22.12+ (le script propose `winget`), fermez/rouvrez la fenêtre, supprimez le dossier `node_modules`, relancez |
| `npm error ENOTEMPTY … rmdir … node_modules` | Fichiers verrouillés (antivirus, OneDrive sur le Bureau, programme ouvert) | Fermez tout, supprimez `node_modules` à la main, déplacez le projet hors du Bureau (ex. `C:\Dev`), relancez |
| `build-setup.bat` : « Node.js introuvable » | Node non installé ou terminal ouvert avant l'installation | Installez Node LTS, puis relancez le script |
| Workflow : « le tag ne correspond pas à la version » | Tag ≠ `package.json` | Alignez les deux, supprimez/recréez le tag |
| SmartScreen bloque l'installation | Setup non signé | §5.1 (Exécuter quand même) ou signature (§4.5) |
