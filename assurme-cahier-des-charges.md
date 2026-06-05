# 📋 Cahier des Charges — AssurMe

> Copilote personnel de gestion des assurances  
> Stack : React (frontend) · Node.js/Express (backend) · PostgreSQL · Claude AI

---

## Table des matières

1. [Architecture du projet](#1-architecture-du-projet)
2. [Setup initial](#2-setup-initial)
3. [Base de données](#3-base-de-données)
4. [Backend — API Node.js](#4-backend--api-nodejs)
5. [Frontend — React](#5-frontend--react)
6. [Fonctionnalité IA — Extraction PDF](#6-fonctionnalité-ia--extraction-pdf)
7. [Fonctionnalités avancées](#7-fonctionnalités-avancées)
8. [Tests](#8-tests)
9. [Déploiement](#9-déploiement)

---

## 1. Architecture du projet

### Structure des dossiers

```
assurme/
├── client/                        # Frontend React
│   ├── public/
│   └── src/
│       ├── assets/                # Images, icônes, polices
│       ├── components/            # Composants réutilisables
│       │   ├── ui/                # Composants génériques (Button, Input, Modal…)
│       │   ├── layout/            # Header, Sidebar, Footer
│       │   └── features/          # Composants métier par domaine
│       │       ├── auth/
│       │       ├── contracts/
│       │       ├── claims/
│       │       └── alerts/
│       ├── hooks/                 # Custom hooks React
│       ├── pages/                 # Pages (une par route)
│       ├── services/              # Appels API (axios)
│       ├── store/                 # État global (Zustand ou Redux)
│       ├── utils/                 # Fonctions utilitaires pures
│       ├── constants/             # Constantes de l'app
│       └── App.jsx
│
├── server/                        # Backend Node.js
│   ├── src/
│   │   ├── config/                # Variables d'env, DB, S3…
│   │   ├── controllers/           # Logique métier par ressource
│   │   ├── middlewares/           # Auth, validation, erreurs
│   │   ├── models/                # Modèles Sequelize
│   │   ├── routes/                # Définition des routes Express
│   │   ├── services/              # Services externes (IA, S3, email)
│   │   ├── utils/                 # Fonctions utilitaires
│   │   └── app.js                 # Point d'entrée Express
│   ├── migrations/                # Migrations Sequelize
│   └── .sequelizerc
│
├── .env.example
├── docker-compose.yml
└── README.md
```

### Principes de code

- **Séparation des responsabilités** : chaque fichier a un rôle unique et précis
- **DRY** : aucune logique dupliquée — extraire dans `utils/` ou `hooks/`
- **Nommage explicite** : préférer `getUserContracts()` à `getData()`
- **Modules courts** : maximum ~150 lignes par fichier
- **Commentaires utiles** : expliquer le *pourquoi*, pas le *comment*

---

## 2. Setup initial

### Étape 1 — Initialiser le projet

```bash
mkdir assurme && cd assurme

# Frontend
npx create-react-app client --template cra-template
# ou avec Vite (recommandé) :
npm create vite@latest client -- --template react

# Backend
mkdir server && cd server
npm init -y
```

### Étape 2 — Installer les dépendances

**Backend**
```bash
cd server
npm install express cors dotenv helmet morgan
npm install sequelize pg pg-hstore         # ORM
npm install -D sequelize-cli
npm install jsonwebtoken bcryptjs          # Auth
npm install multer aws-sdk                 # Upload fichiers
npm install axios                          # Appels API externes
npm install -D nodemon
```

**Frontend**
```bash
cd client
npm install axios react-router-dom
npm install @tanstack/react-query          # Data fetching
npm install zustand                        # State management
npm install react-hook-form zod            # Formulaires + validation
npm install tailwindcss postcss autoprefixer
npm install react-dropzone                 # Upload drag & drop
npm install date-fns                       # Manipulation de dates
npm install lucide-react                   # Icônes
```

### Étape 3 — Configurer les variables d'environnement

Créer `.env` à la racine de `server/` :

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/assurme
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Anthropic
ANTHROPIC_API_KEY=your_key_here

# AWS S3 (stockage PDF)
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=assurme-contracts

# Email (notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_key
```

---

## 3. Base de données

### Étape 4 — Définir les modèles Sequelize

Modèles dans `server/src/models/` :

| Modèle | Fichier | Description |
|--------|---------|-------------|
| User | `user.js` | Utilisateur (email, mot de passe hashé) |
| Contract | `contract.js` | Contrat d'assurance (type, assureur, dates, prime) |
| Coverage | `coverage.js` | Garanties extraites par IA |
| Alert | `alert.js` | Alertes (renouvellement, échéance, doublon) |

Connexion et export des modèles : `server/src/config/db.js`

```javascript
const { User, Contract, Coverage, Alert, sequelize } = require('../config/db');
```

### Étape 5 — Générer et appliquer les migrations

```bash
cd server
npm run migrate
```

---

## 4. Backend — API Node.js

### Étape 6 — Configurer Express (`app.js`)

Fichier : `server/src/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth.routes');
const contractRoutes = require('./routes/contract.routes');
const alertRoutes = require('./routes/alert.routes');
const claimRoutes = require('./routes/claim.routes');

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/claims', claimRoutes);

// Gestion centralisée des erreurs (toujours en dernier)
app.use(errorHandler);

module.exports = app;
```

### Étape 7 — Middleware d'authentification JWT

Fichier : `server/src/middlewares/auth.middleware.js`

```javascript
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new UnauthorizedError('Token manquant');

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    throw new UnauthorizedError('Token invalide');
  }
};

module.exports = { authenticate };
```

### Étape 8 — Middleware de gestion des erreurs

Fichier : `server/src/middlewares/errorHandler.js`

```javascript
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  });
};

module.exports = { errorHandler };
```

Fichier : `server/src/utils/errors.js`

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(msg = 'Ressource introuvable') { super(msg, 404); }
}

class UnauthorizedError extends AppError {
  constructor(msg = 'Non autorisé') { super(msg, 401); }
}

class ValidationError extends AppError {
  constructor(msg) { super(msg, 400); }
}

module.exports = { AppError, NotFoundError, UnauthorizedError, ValidationError };
```

### Étape 9 — Routes et contrôleurs Auth

Fichier : `server/src/routes/auth.routes.js`

```javascript
const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

module.exports = router;
```

Fichier : `server/src/controllers/auth.controller.js`

```javascript
const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { register, login, getMe };
```

Fichier : `server/src/services/auth.service.js`

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

const register = async ({ email, password, firstName, lastName }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ValidationError('Email déjà utilisé');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, firstName, lastName });
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new UnauthorizedError('Identifiants incorrects');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Identifiants incorrects');

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token, user: { id: user.id, email: user.email, firstName: user.firstName } };
};

module.exports = { register, login };
```

### Étape 10 — Routes et contrôleurs Contrats

Fichier : `server/src/routes/contract.routes.js`

```javascript
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const {
  getContracts, getContract, createContract,
  uploadContract, deleteContract
} = require('../controllers/contract.controller');

router.use(authenticate); // Toutes les routes nécessitent une auth

router.get('/', getContracts);
router.get('/:id', getContract);
router.post('/', createContract);
router.post('/:id/upload', upload.single('file'), uploadContract);
router.delete('/:id', deleteContract);

module.exports = router;
```

### Étape 11 — Middleware upload (Multer + S3)

Fichier : `server/src/middlewares/upload.middleware.js`

```javascript
const multer = require('multer');
const { ValidationError } = require('../utils/errors');

const ALLOWED_TYPES = ['application/pdf'];
const MAX_SIZE_MB = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new ValidationError('Seuls les fichiers PDF sont acceptés'));
  },
});

module.exports = upload;
```

---

## 5. Frontend — React

### Étape 12 — Configurer le routage (`App.jsx`)

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ContractsPage from './pages/ContractsPage';
import ContractDetailPage from './pages/ContractDetailPage';
import AlertsPage from './pages/AlertsPage';
import ClaimAssistantPage from './pages/ClaimAssistantPage';
import Layout from './components/layout/Layout';

const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="contracts/:id" element={<ContractDetailPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="claim" element={<ClaimAssistantPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Étape 13 — Store d'authentification (Zustand)

Fichier : `client/src/store/auth.store.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

### Étape 14 — Service API (Axios)

Fichier : `client/src/services/api.js`

```javascript
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Injecter le token automatiquement
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Déconnexion automatique si 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  }
);

export default api;
```

Fichier : `client/src/services/contracts.service.js`

```javascript
import api from './api';

export const contractsService = {
  getAll: () => api.get('/contracts').then((r) => r.data),
  getById: (id) => api.get(`/contracts/${id}`).then((r) => r.data),
  create: (data) => api.post('/contracts', data).then((r) => r.data),
  uploadPdf: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/contracts/${id}/upload`, form).then((r) => r.data);
  },
  delete: (id) => api.delete(`/contracts/${id}`).then((r) => r.data),
};
```

### Étape 15 — Pages principales

**Pages à créer :**

| Page | Fichier | Description |
|------|---------|-------------|
| Login | `LoginPage.jsx` | Formulaire de connexion |
| Register | `RegisterPage.jsx` | Formulaire d'inscription |
| Dashboard | `DashboardPage.jsx` | Vue d'ensemble (stats, alertes récentes, contrats) |
| Contrats | `ContractsPage.jsx` | Liste de tous les contrats |
| Détail contrat | `ContractDetailPage.jsx` | Garanties, PDF, infos extraites par IA |
| Alertes | `AlertsPage.jsx` | Toutes les alertes (échéances, doublons) |
| Assistant sinistre | `ClaimAssistantPage.jsx` | Chatbot guidé étape par étape |

### Étape 16 — Composants UI réutilisables

Créer dans `client/src/components/ui/` :

- `Button.jsx` — Bouton avec variantes (primary, secondary, danger)
- `Input.jsx` — Champ de formulaire avec label + message d'erreur
- `Modal.jsx` — Modale accessible (focus trap)
- `Badge.jsx` — Badge de statut coloré
- `Card.jsx` — Carte conteneur réutilisable
- `Spinner.jsx` — Indicateur de chargement
- `Alert.jsx` — Bandeau d'alerte (success, warning, error)
- `FileDropzone.jsx` — Zone de dépôt de PDF (react-dropzone)

---

## 6. Fonctionnalité IA — Extraction PDF

### Étape 17 — Service d'extraction IA (Claude API)

Fichier : `server/src/services/ai.service.js`

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Extrait les informations clés d'un contrat d'assurance au format PDF (base64)
 * @param {string} pdfBase64 - Contenu du PDF encodé en base64
 * @returns {Promise<Object>} Données structurées du contrat
 */
const extractContractData = async (pdfBase64) => {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
          },
          {
            type: 'text',
            text: `Analyse ce contrat d'assurance et retourne UNIQUEMENT un objet JSON valide 
            (sans markdown, sans texte avant ou après) avec la structure suivante :
            {
              "insurer": "nom de la compagnie",
              "type": "AUTO | HOME | HEALTH | LIFE | PHONE | OTHER",
              "policyNumber": "numéro de police ou null",
              "startDate": "YYYY-MM-DD ou null",
              "endDate": "YYYY-MM-DD ou null",
              "renewalDate": "YYYY-MM-DD ou null",
              "premium": nombre en euros par an ou null,
              "coverages": [
                { "name": "nom garantie", "details": "description", "limit": montant ou null, "deductible": franchise ou null }
              ]
            }`,
          },
        ],
      },
    ],
  });

  const raw = response.content[0].text.trim();
  return JSON.parse(raw);
};

module.exports = { extractContractData };
```

### Étape 18 — Intégrer l'extraction dans le contrôleur contrat

Fichier : `server/src/controllers/contract.controller.js`

```javascript
const contractService = require('../services/contract.service');

const uploadContract = async (req, res, next) => {
  try {
    const result = await contractService.processUpload(req.params.id, req.file, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ... autres actions (getContracts, createContract, etc.)
module.exports = { uploadContract /*, ... */ };
```

Fichier : `server/src/services/contract.service.js`

```javascript
const { Contract, Coverage } = require('../config/db');
const { extractContractData } = require('./ai.service');
const { uploadToS3 } = require('./storage.service');
const { NotFoundError } = require('../utils/errors');

const processUpload = async (contractId, file, userId) => {
  const contract = await Contract.findOne({ where: { id: contractId, userId } });
  if (!contract) throw new NotFoundError('Contrat introuvable');

  const fileUrl = await uploadToS3(file);
  const pdfBase64 = file.buffer.toString('base64');
  const extracted = await extractContractData(pdfBase64);

  await contract.update({
    fileUrl,
    insurer: extracted.insurer,
    policyNumber: extracted.policyNumber,
    startDate: extracted.startDate ? new Date(extracted.startDate) : null,
    endDate: extracted.endDate ? new Date(extracted.endDate) : null,
    renewalDate: extracted.renewalDate ? new Date(extracted.renewalDate) : null,
    premium: extracted.premium,
  });

  await Coverage.destroy({ where: { contractId } });
  await Coverage.bulkCreate(
    extracted.coverages.map((c) => ({ ...c, contractId }))
  );

  return Contract.findByPk(contractId, { include: [Coverage] });
};

module.exports = { processUpload };
```

---

## 7. Fonctionnalités avancées

### Étape 19 — Détecteur de doublons

Fichier : `server/src/services/duplicate.service.js`

```javascript
const { Contract, Coverage } = require('../config/db');

/**
 * Compare les garanties de tous les contrats d'un user
 * et retourne les paires de garanties en doublon potentiel
 */
const detectDuplicates = async (userId) => {
  const contracts = await Contract.findAll({
    where: { userId },
    include: [{ model: Coverage }],
  });

  const duplicates = [];

  // Comparaison naïve par nom de garantie (à enrichir avec IA si besoin)
  const seen = new Map();
  for (const contract of contracts) {
    for (const coverage of contract.Coverages) {
      const key = coverage.name.toLowerCase().trim();
      if (seen.has(key)) {
        duplicates.push({
          coverage: coverage.name,
          contract1: seen.get(key).contractName,
          contract2: contract.name,
        });
      } else {
        seen.set(key, { contractName: contract.name });
      }
    }
  }

  return duplicates;
};

module.exports = { detectDuplicates };
```

### Étape 20 — Alertes d'échéances

Fichier : `server/src/services/alert.service.js`

```javascript
const { Contract, Alert, User } = require('../config/db');
const { addDays } = require('date-fns');
const { Op } = require('sequelize');

const ALERT_DAYS_BEFORE = 30;

/**
 * Génère des alertes pour les contrats dont la date de renouvellement approche
 */
const generateRenewalAlerts = async () => {
  const threshold = addDays(new Date(), ALERT_DAYS_BEFORE);

  const contracts = await Contract.findAll({
    where: {
      renewalDate: { [Op.lte]: threshold, [Op.gte]: new Date() },
    },
    include: [{ model: User }],
  });

  for (const contract of contracts) {
    const alertId = `renewal-${contract.id}`;
    const [alert] = await Alert.findOrCreate({
      where: { id: alertId },
      defaults: {
        id: alertId,
        userId: contract.userId,
        type: 'RENEWAL',
        message: `Votre contrat "${contract.name}" arrive à renouvellement le ${contract.renewalDate.toLocaleDateString('fr-FR')}.`,
        dueDate: contract.renewalDate,
      },
    });
  }
};

module.exports = { generateRenewalAlerts };
```

### Étape 21 — Assistant sinistre (chatbot guidé)

Fichier : `server/src/services/claim.service.js`

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Continue la conversation de l'assistant sinistre
 * @param {Array} history - Historique de la conversation [{role, content}]
 * @param {string} userMessage - Dernier message de l'utilisateur
 */
const chat = async (history, userMessage) => {
  const systemPrompt = `Tu es l'assistant sinistre d'AssurMe. 
  Tu guides l'utilisateur étape par étape pour déclarer son sinistre.
  Tu demandes : type de sinistre, date, circonstances, dommages, contrat concerné.
  Tu génères ensuite un courrier de déclaration prêt à envoyer.
  Réponds toujours en français, avec empathie et clarté.`;

  const messages = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    messages,
  });

  return response.content[0].text;
};

module.exports = { chat };
```

---

## 8. Tests

### Étape 22 — Tests backend (Jest + Supertest)

```bash
cd server
npm install -D jest supertest @jest/globals
```

Créer `server/src/__tests__/auth.test.js` :

```javascript
const request = require('supertest');
const app = require('../app');

describe('POST /api/auth/register', () => {
  it('crée un nouvel utilisateur', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@assurme.fr',
      password: 'Test1234!',
      firstName: 'Jean',
      lastName: 'Dupont',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

### Étape 23 — Tests frontend (Vitest + Testing Library)

```bash
cd client
npm install -D vitest @testing-library/react @testing-library/user-event
```

---

## 9. Déploiement

### Étape 24 — Docker Compose (développement local)

Fichier : `docker-compose.yml`

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: assurme
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  server:
    build: ./server
    ports:
      - "5000:5000"
    env_file: ./server/.env
    depends_on:
      - db

  client:
    build: ./client
    ports:
      - "3000:3000"
    depends_on:
      - server

volumes:
  pgdata:
```

### Étape 25 — Scripts NPM (package.json racine)

```json
{
  "scripts": {
    "dev:server": "cd server && nodemon src/app.js",
    "dev:client": "cd client && npm run dev",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "migrate": "cd server && npm run migrate",
    "test": "cd server && npm test"
  }
}
```

---

## ✅ Checklist d'avancement

### Phase 1 — Socle technique
- [ ] Étape 1 — Initialisation du projet
- [ ] Étape 2 — Installation des dépendances
- [ ] Étape 3 — Variables d'environnement
- [ ] Étape 4 — Modèles Sequelize
- [ ] Étape 5 — Migrations base de données

### Phase 2 — Backend
- [ ] Étape 6 — Configuration Express
- [ ] Étape 7 — Middleware JWT
- [ ] Étape 8 — Gestion des erreurs
- [ ] Étape 9 — Auth (register / login)
- [ ] Étape 10 — CRUD Contrats
- [ ] Étape 11 — Upload Multer

### Phase 3 — Frontend
- [ ] Étape 12 — Routage React
- [ ] Étape 13 — Store Zustand
- [ ] Étape 14 — Service Axios
- [ ] Étape 15 — Pages principales
- [ ] Étape 16 — Composants UI

### Phase 4 — IA & Fonctionnalités
- [ ] Étape 17 — Extraction PDF (Claude API)
- [ ] Étape 18 — Intégration upload + IA
- [ ] Étape 19 — Détecteur de doublons
- [ ] Étape 20 — Alertes d'échéances
- [ ] Étape 21 — Assistant sinistre

### Phase 5 — Qualité & Déploiement
- [ ] Étape 22 — Tests backend
- [ ] Étape 23 — Tests frontend
- [ ] Étape 24 — Docker Compose
- [ ] Étape 25 — Scripts NPM
