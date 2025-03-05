import app from '../../../../index';
import request from 'supertest';
import mongoose from 'mongoose';

const Restaurant = mongoose.model('Restaurant');

const createRestaurant = async () => {
  const token = await global.getToken({ admin: true });

  const formValues = {
    name: "Guigino's",
    userId: global.userId,
    salesforceId: '0017900000IP88qAAD',
  };
  await request(app)
    .post('/api/meal-program/restaurant')
    .set('Authorization', token)
    .send(formValues)
    .expect(201);
  return token;
};

it('creates a restaurant', async () => {
  await createRestaurant();

  const newRest = await Restaurant.findOne({ name: "Guigino's" });
  expect(newRest).toBeDefined();
});

it('gets the restaurant', async () => {
  const token = await createRestaurant();
  const rest = await request(app)
    .get('/api/meal-program/restaurant')
    .set('Authorization', token)
    .expect(200);
});

it('gets the restaurant meal program info', async () => {
  const token = await createRestaurant();
  const rest = await request(app)
    .get('/api/meal-program/restaurant/meal-program-info')
    .set('Authorization', token)
    .expect(200);

  expect(rest.body.remainingDocs?.length).toBeGreaterThan(0);
});
