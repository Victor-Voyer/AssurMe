const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('retourne le statut opérationnel', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/opérationnelle/i);
  });
});
