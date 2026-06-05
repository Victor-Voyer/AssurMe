const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/db');

const uniqueEmail = () => `test-${Date.now()}@assurme.fr`;

describe('POST /api/auth/register', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  it('crée un nouvel utilisateur', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: uniqueEmail(),
      password: 'Test1234!',
      firstName: 'Jean',
      lastName: 'Dupont',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBeDefined();
    expect(res.body.data.firstName).toBe('Jean');
  });

  it('rejette un email déjà utilisé', async () => {
    const email = uniqueEmail();
    await request(app).post('/api/auth/register').send({
      email,
      password: 'Test1234!',
      firstName: 'Jean',
      lastName: 'Dupont',
    });

    const res = await request(app).post('/api/auth/register').send({
      email,
      password: 'Test1234!',
      firstName: 'Marie',
      lastName: 'Martin',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  it('connecte un utilisateur valide', async () => {
    const email = uniqueEmail();
    const password = 'Test1234!';

    await request(app).post('/api/auth/register').send({
      email,
      password,
      firstName: 'Paul',
      lastName: 'Durand',
    });

    const res = await request(app).post('/api/auth/login').send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(email);
  });
});
