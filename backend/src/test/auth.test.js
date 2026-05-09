import request from 'supertest';
import app from '../app.js';

describe('Auth API', () => {
  it('POST /api/auth/register', async () => {
    const unique = Date.now();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: `testuser_${unique}`,
        email: `test_${unique}@test.com`,
        password: '123456',
      });

    expect(res.statusCode).toBe(201);
  });
});
