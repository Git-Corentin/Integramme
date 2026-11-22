# Integramme — enquêtes logiques

Jouer, générer, résoudre et **comprendre** les integrammes (grilles logiques).

- **Jouer** : grille interactive (tactile et souris), annuler/rétablir, exclusion automatique, indices progressifs (« coup de pouce » puis explication complète), vérification, sauvegarde automatique, partage par lien.
- **Créer** : générateur à 5 niveaux (Facile → Extrême), 6 univers, tailles de 3×4 à 6×6, enquête du jour. Chaque grille a une solution unique et se résout par le raisonnement.
- **Solveur** : saisissez n’importe quel integramme ; l’outil vérifie l’unicité, estime la difficulté et explique la solution étape par étape, avec des mots.
- **Méthode** : toutes les techniques illustrées (exclusions, transitivité, élimination croisée, sous-ensembles, comparaisons, écarts, raisonnement par l’absurde, disjonction de cas) et la sémantique des indices (soit/soit, l’un/l’autre, conditionnels, négations implicites…).
- **Application installable** (PWA) : icône sur l’écran d’accueil Android, fonctionne hors ligne.

Aucune dépendance, aucune étape de compilation : ce sont des fichiers statiques.

## L’installer sur Android

1. Ouvrez l’adresse GitHub Pages dans **Chrome**.
2. Touchez l’icône d’installation dans la barre du haut de l’application, ou le menu **⋮ → Installer l’application** (ou *Ajouter à l’écran d’accueil*).
3. Integramme apparaît avec son logo parmi vos applications et s’ouvre en plein écran, même hors connexion.

## Mettre à jour

Remplacez les fichiers sur GitHub. Pour forcer les appareils à recharger immédiatement les fichiers mis en cache, augmentez le numéro de version dans `sw.js` (`integramme-v1` → `integramme-v2`).

## Tester en local

Les Web Workers et le mode hors ligne exigent un serveur (pas un double-clic sur le fichier) :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Organisation du code

| Fichier | Rôle |
|---|---|
| `js/core.js` | Moteur logique : modèle de grille, règles de déduction (niveaux 1 à 5), solveur expliqué, recherche exhaustive, phrases en français |
| `js/generator.js` | Générateur : solution aléatoire, indices vrais, ajout jusqu’à l’unicité, réduction, notation de la difficulté |
| `js/themes.js` | Univers du générateur et modèles de phrases (accords, élisions) |
| `js/worker.js` | Calculs lourds hors du fil principal |
| `js/app.js` | Interface : jeu, création, solveur/éditeur, visionneuse de solution |
| `js/method.js` | Contenu et illustrations animées de la méthode |
| `css/app.css` | Styles (thème clair/sombre, mobile/bureau) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Application installable et hors ligne |

### Techniques du solveur

| Niveau | Techniques |
|---|---|
| 1 · Évident | lecture des indices, exclusion ligne/colonne, dernière possibilité |
| 2 · Simple | transitivité, « soit… soit », « l’un… l’autre », bornes des comparaisons et écarts |
| 3 · Avancé | élimination croisée, sous-ensembles réservés, déductions indirectes des indices à deux options |
| 4 · Expert | raisonnement par l’absurde (chaîne de déductions jusqu’à la contradiction), disjonction de cas |
| 5 · Exhaustif | recherche systématique (jamais nécessaire pour les grilles générées) |

### Format d’un integramme (JSON)

```json
{
  "title": "…", "intro": "…",
  "cats": [
    { "name": "Prénom", "kind": "name", "items": [{ "label": "Alice", "g": "f" }], "tpl": { "pred": "est {x}", "neg": "n’est pas {x}", "ref": "{x}" } },
    { "name": "Âge", "kind": "ord", "items": [{ "label": "20 ans", "v": 20 }], "k": { "one": "an", "many": "ans" }, "tpl": { "…": "…" } }
  ],
  "clues": [
    { "t": "is", "a": 0, "b": 5 },
    { "t": "lt", "a": 1, "b": 6, "o": 2 }
  ]
}
```

Les éléments sont désignés par un index global `catégorie × N + rang`. Types d’indices : `is`, `not`, `either`, `pair`, `lt`, `diff`, `dist`, `alldiff`.
