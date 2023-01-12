const app = require('../../../index.js');
const request = require('supertest');

it('gets all recipes', async () => {
  const res = await request(app).get('/api/recipes');
  expect(res.status).toEqual(200);
});

it('posts a recipe', async () => {
  const token = await global.getToken({ admin: true });
  const res = await request(app)
    .post('/api/recipe')
    .set('Authorization', token)
    .send({
      name: 'bacon',
      ingredients: 'pig',
      description: 'a recipe from the old country',
      instructions: 'fry it up!',
    })
    .expect(201);

  expect(res.body.name).toEqual('bacon');
});
