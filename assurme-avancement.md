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
| Phase 3 — Frontend | Terminée | 100 % |
| Phase 4 — IA & Fonctionnalités | Terminée | 100 % |
| Phase 5 — Qualité & Déploiement | Terminée | 100 % |

**Stack actuelle :** React (Vite) · Node.js/Express · PostgreSQL · **Sequelize** · Claude AI

**Projet terminé** — prêt pour les tests locaux.

---

## Ce qui a été fait

### Phase 1 — Socle technique (Étapes 1–5)

- [x] Repo Git, frontend Vite + React, backend Node.js/Express
- [x] Dépendances installées (backend + frontend)
- [x] Variables d'environnement (`.env`, `.env.example`)
- [x] Tailwind CSS v4
- [x] Modèles Sequelize + migration initiale
- [x] Docker PostgreSQL (port **5433** pour éviter conflit avec Postgres local)

### Phase 2 — Backend (Étapes 6–11)

- [x] Express (`app.js`, `index.js`), gestion centralisée des erreurs
- [x] Auth JWT : `POST /register`, `POST /login`, `GET /me`
- [x] CRUD contrats : `GET/POST/DELETE /api/contracts`, upload PDF
- [x] Multer + stockage S3 (mode local si AWS non configuré)

### Phase 3 — Frontend (Étapes 12–16)

- [x] Routage React, store Zustand, services Axios, React Query
- [x] Pages : Login, Register, Dashboard, Contrats, Détail, Alertes, Sinistre
- [x] Composants UI + layout (Header, Sidebar)

### Phase 4 — IA & Fonctionnalités (Étapes 17–21)

- [x] `ai.service.js` — extraction PDF via Claude API
- [x] Intégration upload → S3 → extraction IA → mise à jour BDD
- [x] `duplicate.service.js` — détection de garanties en doublon
- [x] `alert.service.js` — alertes renouvellement (30 j) + doublons
- [x] Routes `/api/alerts` (liste, marquer comme lu)
- [x] `claim.service.js` + route `POST /api/claims/chat`
- [x] Frontend connecté (AlertsPage, ClaimAssistantPage, Dashboard)

### Phase 5 — Qualité & Déploiement (Étapes 22–25)

- [x] Tests backend Jest + Supertest (`health.test.js`, `auth.test.js`)
- [x] Tests frontend Vitest + Testing Library (`Button.test.jsx`)
- [x] Docker Compose complet (`db` + `server` + `client`)
- [x] `package.json` racine avec scripts `dev`, `migrate`, `test`
- [x] Dockerfiles server + client

---

## Structure finale du projet

```
assurme/
├── client/
│   ├── Dockerfile
│   └── src/
│       ├── components/ui/       # Design system
│       ├── components/layout/   # Header, Sidebar, Layout
│       ├── pages/               # 7 pages
│       ├── services/            # api, auth, contracts, alerts, claims
│       ├── store/
│       └── test/
├── server/
│   ├── Dockerfile
│   ├── migrations/
│   └── src/
│       ├── controllers/         # auth, contract, alert, claim
│       ├── routes/              # auth, contract, alert, claim
│       ├── services/            # auth, contract, ai, alert, claim, duplicate, storage
│       ├── middlewares/
│       ├── models/
│       └── __tests__/
├── docker-compose.yml
├── package.json
├── README.md
└── assurme-avancement.md
```

---

## API disponible

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/health` | GET | Santé de l'API |
| `/api/auth/register` | POST | Inscription |
| `/api/auth/login` | POST | Connexion |
| `/api/auth/me` | GET | Profil (JWT) |
| `/api/contracts` | GET/POST | Liste / création |
| `/api/contracts/:id` | GET/DELETE | Détail / suppression |
| `/api/contracts/:id/upload` | POST | Upload PDF + extraction IA |
| `/api/alerts` | GET | Alertes (génération auto) |
| `/api/alerts/:id/read` | PATCH | Marquer comme lue |
| `/api/claims/chat` | POST | Assistant sinistre |

---

## Plan de commits suggéré

| # | Commit | Statut |
|---|--------|--------|
| ✅ 1 | `chore: initialiser le projet AssurMe` | Fait |
| ✅ 2 | `feat(db): schéma Sequelize et migration initiale` | Fait |
| ✅ 3 | `refactor(db): remplacer Prisma par Sequelize` | Fait |
| ⏳ 4 | `feat(server): configurer Express et gestion des erreurs` | À committer |
| ⏳ 5 | `feat(server): authentification JWT` | À committer |
| ⏳ 6 | `feat(server): CRUD contrats et upload PDF` | À committer |
| ⏳ 7 | `feat(client): routage, store et services API` | À committer |
| ⏳ 8 | `feat(client): pages et composants UI` | À committer |
| ⏳ 9 | `feat(server): extraction IA et fonctionnalités avancées` | À committer |
| ⏳ 10 | `chore: tests, Docker et scripts NPM racine` | À committer |

---

## Tests locaux (à lancer quand prêt)

```bash
# 1. Base de données
docker compose up -d db
cd server && npm run migrate

# 2. Lancer l'app
npm run dev

# 3. Ouvrir http://localhost:5173
#    → S'inscrire, créer un contrat, tester alertes et assistant sinistre

# 4. Tests automatisés
npm test
```

### Modes dégradés (sans clés API)

| Service | Comportement sans clé |
|---------|----------------------|
| `ANTHROPIC_API_KEY` | Upload PDF sans extraction IA ; assistant sinistre en mode guidé |
| `AWS_*` | PDF stocké en `local://` (pas d'upload S3 réel) |

---

## Configuration requise pour la prod

- [ ] Clé `ANTHROPIC_API_KEY` valide
- [ ] Bucket S3 configuré (`AWS_*`)
- [ ] `JWT_SECRET` fort et unique
- [ ] SMTP pour notifications email (optionnel, non implémenté côté envoi)
