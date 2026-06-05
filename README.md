# AssurMe

Copilote personnel de gestion des assurances.

**Stack :** React (Vite) · Node.js/Express · PostgreSQL · Sequelize · Claude AI

## Structure

```
assurme/
├── client/     # Frontend React
├── server/     # Backend Node.js
└── docker-compose.yml
```

## Prérequis

- Node.js 18+
- PostgreSQL 15+ (ou Docker)

## Installation

```bash
# Backend
cd server
cp .env.example .env
npm install

# Frontend
cd client
cp .env.example .env
npm install
```

## Base de données

```bash
docker compose up -d db
cd server && cp .env.example .env && npm run migrate
```

## Développement

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

## Variables d'environnement

Voir `server/.env.example` et `client/.env.example`.
