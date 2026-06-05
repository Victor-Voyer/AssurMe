# AssurMe

Copilote personnel de gestion des assurances.

**Stack :** React (Vite) · Node.js/Express · PostgreSQL · Sequelize · Claude AI

## Fonctionnalités

- Authentification JWT (inscription, connexion)
- Gestion des contrats d'assurance (CRUD)
- Upload de PDF avec extraction IA (Claude API)
- Alertes automatiques (renouvellement, doublons de garanties)
- Assistant sinistre conversationnel (Claude API)

## Structure

```
assurme/
├── client/          # Frontend React
├── server/          # Backend Node.js / Express
├── docker-compose.yml
└── package.json     # Scripts racine
```

## Prérequis

- Node.js 20+
- Docker Desktop (recommandé pour PostgreSQL)

## Installation rapide

```bash
# Dépendances
npm run install:all

# Variables d'environnement
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## Base de données

PostgreSQL tourne sur le port **5433** (pour éviter les conflits avec un Postgres local sur 5432).

```bash
docker compose up -d db
cd server && npm run migrate
```

## Développement

```bash
# Les deux en parallèle
npm run dev

# Ou séparément
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

## Docker complet

```bash
docker compose up -d
docker compose exec server npm run migrate
```

- API : http://localhost:5000
- Frontend : http://localhost:5173

## Tests

```bash
# Tous les tests
npm test

# Backend seul (health sans DB, auth nécessite PostgreSQL)
npm run test:server

# Frontend seul
npm run test:client
```

## Variables d'environnement

| Service | Fichier | Variables clés |
|---------|---------|----------------|
| Backend | `server/.env` | `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `AWS_*` |
| Frontend | `client/.env` | `VITE_API_URL` |

> Sans `ANTHROPIC_API_KEY` valide, l'upload PDF et l'assistant sinistre fonctionnent en mode dégradé.  
> Sans credentials AWS valides, les PDF sont stockés en mode local (`local://`).

## Documentation

- [Cahier des charges](./assurme-cahier-des-charges.md)
- [État d'avancement](./assurme-avancement.md)
