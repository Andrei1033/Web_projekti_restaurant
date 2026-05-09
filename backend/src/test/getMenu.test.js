import request from 'supertest';
import app from '../app.js';

test('GET /api/menu/week returns menu', async () => {
  const res = await request(app).get('/api/menu/week');

  expect(res.statusCode).toBe(200);
  expect(typeof res.body).toBe('object');
});
