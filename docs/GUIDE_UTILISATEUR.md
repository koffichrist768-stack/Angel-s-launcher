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
- **Automatique** : les jeux sans pochette sont recherchés en ligne (SteamGridDB si une clé API est saisie, puis Steam) à l'ajout, après un scan et au démarrage.
  Pendant la recherche, la carte pulse et affiche « Recherche… ». Un jeu introuvable est retenté après 7 jours.
- **Manuel** : survolez une carte et cliquez sur l'icône image (ou « Pochette » dans le héros). Vous pouvez :
  1. **Chercher** un autre titre, sur **SteamGridDB** (choisir le jeu, puis la pochette parmi les vignettes) ou sur **Steam** (cliquer sur le bon résultat) ;
  2. lancer la **recherche automatique** pour ce jeu ;
  3. choisir une **image locale** (png, jpg, webp, gif) ;
  4. **retirer** la pochette (le jeu n'est alors plus recherché automatiquement).
- **Tout d'un coup** : « Rechercher les pochettes manquantes » dans l'Accès rapide de la bibliothèque.
- **Désactiver** : Paramètres › Général › « Recherche automatique des pochettes » (puis Enregistrer).
  Seul le nom du jeu est envoyé à SteamGridDB / Steam ; aucune autre donnée.
- **Clé API SteamGridDB** : gratuite, à générer sur https://www.steamgriddb.com/profile/preferences/api puis à coller dans
  Paramètres › Services en ligne (« Tester la clé », puis « Enregistrer ») — détails dans [GUIDE_MANIPULATIONS.md](GUIDE_MANIPULATIONS.md). Sans clé, le bouton « Ouvrir SteamGridDB » de la fenêtre Pochette
  ouvre le site : enregistrez l'image voulue, puis choisissez « Image locale… ».

## Favoris
Cliquez sur le cœur d'une carte. La page *Favoris* présente le coup de cœur, la grille et des statistiques.

## Paramètres
Modifiez puis cliquez **Enregistrer les modifications** (l'aperçu du thème est immédiat, l'enregistrement ne l'est pas).
**Restaurer par défaut** réinitialise tous les réglages. Onglet *Sauvegardes locales* : choisir un dossier puis
« Créer une sauvegarde ».
