import request from 'supertest';
import app from '../app.js';

test('POST /api/auth/login logs user in', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'test@example.com',
    password: 'password123',
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.token).toBeDefined();
});
