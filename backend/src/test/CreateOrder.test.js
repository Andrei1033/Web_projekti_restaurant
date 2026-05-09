import request from 'supertest';
import app from '../app.js';

test('POST /api/orders creates order', async () => {
  const res = await request(app)
    .post('/api/orders')
    .send({
      guest_name: 'John Doe',
      guest_email: 'john@test.com',
      pickup_date: '2026-05-10',
      pickup_time: '12:00',
      guest_count: 2,
      items: [
        {
          dish_id: 1,
          quantity: 1,
          unit_price: 10,
        },
      ],
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.id).toBeDefined();
  expect(res.body.items.length).toBeGreaterThan(0);
});
