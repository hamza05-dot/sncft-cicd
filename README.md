# SNCFT — Système de Gestion des Trains

Application de gestion et de consultation des horaires de trains, inspirée du
système de la Société Nationale des Chemins de Fer Tunisiens (SNCFT). Réalisée
dans le cadre d'un stage d'initiation en développement logiciel.

## Stack technique

| Couche      | Techno                                      |
|-------------|----------------------------------------------|
| Backend     | Symfony 7 (PHP), API REST, Doctrine ORM      |
| Frontend    | Next.js (React, TypeScript), Tailwind CSS    |
| Base de données | PostgreSQL                              |
| Auth        | JWT (LexikJWTAuthenticationBundle)           |
| Conteneurisation | Docker Compose (backend, frontend, db)  |

## Structure du projet

```
sncft-cicd/
├── backend/                  Symfony API
│   ├── src/
│   │   ├── Controller/       Endpoints REST (Ligne, Horaire, Trajet, Train,
│   │   │                     Station, Personnel, Maintenance, Favori,
│   │   │                     Notification, Auth...)
│   │   ├── Entity/           Modèle de données (voir plus bas)
│   │   ├── Repository/       Requêtes Doctrine personnalisées
│   │   └── DataFixtures/     Données de démo / seed (voir Ete2026Fixtures.php)
│   └── ...
├── frontend/                 Next.js
│   ├── app/                  Pages (page.tsx = accueil, /horaires, /dashboard,
│   │                         /login, /espace-employe...)
│   ├── lib/api.ts            Client API centralisé (axios)
│   └── types/index.ts        Types TypeScript partagés
└── docker-compose.yml
```

## Modèle de données (entités principales)

- **Ligne** — une ligne ferroviaire (ex: Tunis–Tozeur), a un `nom` et un `code`
- **Station** — un arrêt (`nom`, `ville`, `adresse`)
- **LigneStation** — table de jonction Ligne↔Station, avec un `ordre` qui donne
  la position de la station le long de la ligne
- **Trajet** — un trajet concret entre deux stations sur une ligne donnée
  (`stationDepart`, `stationArrivee`, `distanceKm`)
- **Train** — un train (`numero`, `type`, `capacite`)
- **Horaire** — un horaire concret : un `Train` qui parcourt un `Trajet` à une
  heure donnée (`heureDepart`, `heureArrivee`, `jours`, `statut`,
  `retardMinutes`)
- **Personnel** — employés SNCFT (`nom`, `prenom`, `role`...)
- **Maintenance** — interventions de maintenance sur un train
- **Favori** — un horaire qu'un utilisateur a mis en favori (pour recevoir des
  notifications de retard)
- **Notification** — notifications envoyées aux utilisateurs
- **Reservation** — réservation d'une place sur un horaire
- **User** — comptes (admin / voyageur), authentification JWT

## Fonctionnalités développées

### Côté public / voyageur
- Page d'accueil avec sélection de ligne (cartes cliquables)
- Tableau horaire dynamique par ligne : une ligne par train, une colonne par
  station, avec l'heure de passage
- Ajout/retrait de favoris (⭐) sur un train pour être notifié en cas de retard
- Inscription / connexion (JWT)

### Côté admin / employé
- Dashboard admin (`/dashboard`)
- Espace employé (`/espace-employe`)
- CRUD sur trains, stations, trajets, horaires, personnel, maintenances
- Mise à jour du statut d'un horaire (à l'heure / retard / annulé) avec
  déclenchement de notifications

## Lancer le projet

```bash
# À la racine du projet
docker-compose up -d

# Charger les données de démo (voir aussi Ete2026Fixtures.php / son README)
docker-compose exec backend php bin/console doctrine:fixtures:load

# Backend disponible sur http://localhost:8080/api
# Frontend disponible sur http://localhost:3000 (ou le port configuré)
```

Compte admin de test : `admin@sncft.tn` (mot de passe défini lors du setup).

## Données de démonstration

Le fichier `Ete2026Fixtures.php` (voir le README associé) contient les vraies
données SNCFT "Été 2026" pour la ligne Tunis–Tozeur (transcription complète des
deux sens). Les autres grandes lignes (Annaba, Bizerte, Le Kef, Nabeul) et les
lignes de banlieue (Erriadh, Bougatfa, Gobaa) ont leur structure (Ligne +
Stations) prête, en attendant l'ajout des horaires complets.

## Points connus à améliorer / TODO

- `distanceKm` sur les trajets seedés est une valeur *placeholder* (pas les
  vraies distances SNCFT)
- Certaines cases du tableau horaire "Été 2026" sont marquées `VERIFY` dans le
  fixture — à confirmer contre le PDF officiel avant usage en soutenance
- Horaires des lignes de banlieue (Erriadh/Bougatfa/Gobaa) pas encore seedées
  (volume important de trains quasi-identiques, à seeder en partie ou en
  totalité selon le besoin)
- Pas de tests automatisés backend/frontend à ce stade

## Historique du projet

Développé progressivement au fil du stage :
1. Mise en place Docker (Symfony + Next.js + PostgreSQL)
2. Authentification (login admin, inscription client, JWT)
3. CRUD de base (trains, stations, trajets, horaires, personnel, maintenance)
4. Recherche horaire par ligne (départ/arrivée dynamiques selon la ligne)
5. Tableau horaire type "panneau de gare" (station × train)
6. Système de favoris + notifications de retard
7. Seed de vraies données SNCFT (Été 2026)
