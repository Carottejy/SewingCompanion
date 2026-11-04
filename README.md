# Sewing Companion

Application Android (APK) pour gérer ses projets de couture et puiser dans un catalogue de patrons classés par époque.

## Fonctionnalités

- **Mes projets** : nom, description, statut (idée, en cours, en pause, terminé), **date limite** avec compte à rebours,
  photo, liste de tissus et fournitures.
- **Plusieurs patrons par projet**, chacun avec son avancement (à faire, en cours, fait) et un temps ajustable.
- **Temps estimé** calculé à partir des patrons (ou fixé à la main), **journal des séances** de couture,
  temps restant et nombre d'heures par semaine nécessaires pour tenir la date limite.
- **Tissu à prévoir** : total des métrages des patrons du projet.
- **Catalogue** de patrons réels (éditeurs indépendants et historiques, tutoriels gratuits) classés par époque :
  moderne, vintage, édouardien, victorien, Régence, XVIIIᵉ, Renaissance, médiéval, viking, costumes du monde.
  Chaque patron indique difficulté (1 à 5), temps de travail estimé, métrage de tissu et tissus conseillés,
  avec un lien vers la page de l'éditeur. Recherche, filtres (type, difficulté, gratuits, favoris) et tri.
- **Mes patrons** : ajout de ses propres patrons (photo, métrage, temps, lien, notes).
- **Sauvegarde / restauration** en fichier JSON. Les données restent sur le téléphone.
- Fonctionne hors ligne. Le catalogue peut être mis à jour depuis l'app (il est lu dans ce dépôt).

> Les temps et métrages sont des estimations pour une taille moyenne, sauf mention « d'après l'éditeur ».

## Installer l'APK

Chaque push sur `main` compile un APK signé via GitHub Actions et le publie dans
[Releases](https://github.com/Carottejy/SewingCompanion/releases/latest).
Ouvre ce lien sur le téléphone, télécharge le fichier `.apk`, puis autorise l'installation depuis le navigateur.
Les versions suivantes s'installent par-dessus sans perte de données (même clé de signature).

## Développement

```bash
npm install
npm run dev          # version web sur http://localhost:5173
npm run build && npx cap sync android   # puis ouvrir android/ dans Android Studio
```

Stack : React 19 + TypeScript + Vite, Capacitor 8 (Android), stockage IndexedDB.

### Enrichir le catalogue

Le catalogue est dans `src/data/catalogue.json` (champ `misAJour` à incrémenter). Après un push,
le bouton « Chercher une mise à jour du catalogue » des réglages récupère la nouvelle version sans réinstaller l'APK.

### Signature

La clé de signature (`android/app/sewing-companion.keystore` + `keystore.properties`) est versionnée pour que
toutes les versions s'installent par-dessus les précédentes. C'est acceptable pour une app personnelle
installée hors Play Store ; pour une publication, déplacer la clé dans des secrets GitHub
(`KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`).
