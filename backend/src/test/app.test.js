import request from 'supertest';
import app from '../app.js';

describe('app related tests', () => {
  it('Should test that server is running', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('🔥 NightWolf API running on port!');
  });
});
