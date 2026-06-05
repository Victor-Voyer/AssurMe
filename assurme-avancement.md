# AssurMe — État d'avancement du projet

> Résumé de ce qui a été réalisé et de ce qu'il reste à faire.  
> Référence : [`assurme-cahier-des-charges.md`](./assurme-cahier-des-charges.md)

**Dernière mise à jour :** 5 juin 2026

---

## Vue d'ensemble

| Phase | Statut | Progression |
|-------|--------|-------------|
| Phase 1 — Socle technique | Terminée | 100 % |
| Phase 2 — Backend | Terminée | 100 % |
| Phase 3 — Frontend | À faire | ~5 % |
| Phase 4 — IA & Fonctionnalités | À faire | 0 % |
| Phase 5 — Qualité & Déploiement | À faire | ~20 % |

**Stack actuelle :** React (Vite) · Node.js/Express · PostgreSQL · **Sequelize** · Claude AI

---

## Ce qui a été fait

### Initialisation du projet (Étapes 1–3)

- [x] Repo Git initialisé et poussé sur `origin/main`
- [x] Frontend **Vite + React** créé dans `client/`
- [x] Backend **Node.js** créé dans `server/`
- [x] Dépendances installées :
  - **Backend :** express, cors, dotenv, helmet, morgan, sequelize, pg, jsonwebtoken, bcryptjs, multer, aws-sdk, axios, nodemon, sequelize-cli
  - **Frontend :** axios, react-router-dom, @tanstack/react-query, zustand, react-hook-form, zod, react-dropzone, date-fns, lucide-react, tailwindcss
- [x] Fichiers racine : `.gitignore`, `README.md`
- [x] Variables d'environnement configurées localement (`server/.env`, `client/.env`)
- [x] Tailwind CSS v4 configuré (`client/vite.config.js`, `client/src/index.css`)

### Base de données — Sequelize (Étapes 4–5)

- [x] **Prisma entièrement retiré** du projet (dossier, dépendances, références dans le CDC)
- [x] ORM remplacé par **Sequelize** :
  - Modèles : `User`, `Contract`, `Coverage`, `Alert` (`server/src/models/`)
  - Connexion : `server/src/config/db.js`
  - Config CLI : `server/.sequelizerc`, `server/src/config/database.js`
- [x] Migration initiale créée : `server/migrations/20250605000000-init.js`
- [x] Scripts npm : `migrate`, `migrate:undo`, `migrate:status`
- [x] Cahier des charges mis à jour pour refléter Sequelize (exemples de code, structure, checklist)

### Infrastructure partielle (Étape 24)

- [x] `docker-compose.yml` avec service **PostgreSQL 15** uniquement

### Fichiers d'environnement documentés

- [x] `server/.env.example` et `client/.env.example` créés

### Backend Express (Étapes 6–11)

- [x] **Express** configuré : `server/src/app.js`, `server/src/index.js`
  - Middlewares globaux : helmet, cors, morgan, express.json
  - Route santé : `GET /api/health`
- [x] **Gestion des erreurs** : `server/src/utils/errors.js`, `server/src/middlewares/errorHandler.js`
- [x] **Auth JWT** : `server/src/middlewares/auth.middleware.js`
- [x] **Routes auth** (`/api/auth`) :
  - `POST /register` — inscription
  - `POST /login` — connexion
  - `GET /me` — profil utilisateur (protégé)
- [x] **Routes contrats** (`/api/contracts`, toutes protégées) :
  - `GET /` — liste des contrats
  - `GET /:id` — détail d'un contrat (avec garanties)
  - `POST /` — créer un contrat
  - `POST /:id/upload` — upload PDF
  - `DELETE /:id` — supprimer un contrat
- [x] **Upload** : `server/src/middlewares/upload.middleware.js` (Multer, PDF max 10 Mo)
- [x] **Stockage S3** : `server/src/services/storage.service.js`

> L'extraction IA des PDF (étape 17) n'est pas encore branchée sur l'upload — le fichier est stocké sur S3 et `fileUrl` est mis à jour.

---

## Ce qui reste à faire

### Vérification locale (à faire manuellement)

- [ ] Démarrer Docker Desktop, puis appliquer les migrations :
  ```bash
  docker compose up -d db
  cd server && npm run migrate
  cd server && npm run dev
  ```

Routes additionnelles prévues dans le CDC (non encore implémentées) :
- `/api/alerts` — gestion des alertes
- `/api/claims` — assistant sinistre

---

### Phase 3 — Frontend (Étapes 12–16)

| Étape | Fichiers à créer | Description |
|-------|------------------|-------------|
| 12 | `client/src/App.jsx` | Routage React (login, dashboard, contrats, alertes, sinistre) |
| 13 | `client/src/store/auth.store.js` | Store Zustand avec persistance |
| 14 | `client/src/services/api.js`, `client/src/services/contracts.service.js` | Client Axios + intercepteurs |
| 15 | Pages : `LoginPage`, `RegisterPage`, `DashboardPage`, `ContractsPage`, `ContractDetailPage`, `AlertsPage`, `ClaimAssistantPage` | Interfaces utilisateur |
| 16 | Composants UI : `Button`, `Input`, `Modal`, `Badge`, `Card`, `Spinner`, `Alert`, `FileDropzone` + layout (`Header`, `Sidebar`, `Layout`) | Design system réutilisable |

> Le frontend est encore au template Vite par défaut. La structure de dossiers (`components/`, `pages/`, `hooks/`, etc.) reste à créer.

---

### Phase 4 — IA & Fonctionnalités avancées (Étapes 17–21)

| Étape | Fichier | Description |
|-------|---------|-------------|
| 17 | `server/src/services/ai.service.js` | Extraction des données d'un PDF via Claude API |
| 18 | Intégration dans `contract.service.js` | Upload PDF → S3 → extraction IA → mise à jour BDD |
| 19 | `server/src/services/duplicate.service.js` | Détection de garanties en doublon entre contrats |
| 20 | `server/src/services/alert.service.js` | Génération d'alertes de renouvellement (30 jours avant) |
| 21 | `server/src/services/claim.service.js` + routes | Assistant sinistre conversationnel (chatbot guidé) |

---

### Phase 5 — Qualité & Déploiement (Étapes 22–25)

| Étape | Description | Statut |
|-------|-------------|--------|
| 22 | Tests backend (Jest + Supertest) — `server/src/__tests__/auth.test.js` | À faire |
| 23 | Tests frontend (Vitest + Testing Library) | À faire |
| 24 | Docker Compose complet (services `server` + `client` en plus de `db`) | Partiel (DB seule) |
| 25 | `package.json` racine avec scripts `dev`, `dev:server`, `dev:client`, `migrate`, `test` | À faire |

---

## Plan de commits suggéré (suite)

Chaque bloc correspond à un commit logique, comme convenu au démarrage du projet :

| # | Commit | Étapes CDC |
|---|--------|------------|
| ✅ 1 | `chore: initialiser le projet AssurMe` | 1–3 |
| ✅ 2 | `feat(db): schéma Sequelize et migration initiale` | 4–5 |
| ✅ 3 | `refactor(db): remplacer Prisma par Sequelize` | — |
| ⏳ 4 | `feat(server): configurer Express et gestion des erreurs` | 6–8 |
| ⏳ 5 | `feat(server): authentification JWT` | 9 |
| ⏳ 6 | `feat(server): CRUD contrats et upload PDF` | 10–11 |
| 7 | `feat(client): routage, store et services API` | 12–14 |
| 8 | `feat(client): pages et composants UI` | 15–16 |
| 9 | `feat(server): extraction IA et fonctionnalités avancées` | 17–21 |
| 10 | `chore: tests, Docker et scripts NPM racine` | 22–25 |

---

## Structure actuelle du projet

```
assurme/
├── client/                    # Frontend React (template Vite)
│   └── src/
│       ├── App.jsx            # À remplacer par le routage AssurMe
│       └── index.css          # Tailwind configuré
│
├── server/                    # Backend Node.js
│   ├── migrations/
│   │   └── 20250605000000-init.js
│   ├── src/
│   │   ├── app.js             # Config Express
│   │   ├── index.js           # Point d'entrée
│   │   ├── config/
│   │   │   ├── database.js    # Config Sequelize CLI
│   │   │   └── db.js          # Instance + modèles
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── contract.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.middleware.js
│   │   ├── models/
│   │   │   ├── user.js
│   │   │   ├── contract.js
│   │   │   ├── coverage.js
│   │   │   ├── alert.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── contract.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── contract.service.js
│   │   │   └── storage.service.js
│   │   └── utils/
│   │       └── errors.js
│   ├── .env.example
│   └── .sequelizerc
│
├── docker-compose.yml         # PostgreSQL uniquement
├── assurme-cahier-des-charges.md
├── assurme-avancement.md      # Ce fichier
└── README.md
```

---

## Prochaine étape recommandée

**Phase 3 — Frontend React** (étapes 12 à 16) : routage, store Zustand, services API Axios, pages et composants UI.

Commits backend à créer (3 commits séparés recommandés) :

```bash
git add server/src/app.js server/src/index.js server/src/utils/ server/src/middlewares/errorHandler.js
git commit -m "feat(server): configurer Express et gestion des erreurs"

git add server/src/middlewares/auth.middleware.js server/src/routes/auth.routes.js server/src/controllers/auth.controller.js server/src/services/auth.service.js
git commit -m "feat(server): authentification JWT"

git add server/src/routes/contract.routes.js server/src/controllers/contract.controller.js server/src/services/contract.service.js server/src/middlewares/upload.middleware.js server/src/services/storage.service.js server/.env.example client/.env.example
git commit -m "feat(server): CRUD contrats et upload PDF"
```

Pour lancer le développement local :

```bash
# Base de données (Docker Desktop requis)
docker compose up -d db
cd server && npm run migrate

# API
cd server && npm run dev

# Frontend
cd client && npm run dev
```
