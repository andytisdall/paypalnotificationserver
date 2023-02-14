import app from '../../../../index';
import request from 'supertest';

it('gets all recipes', async () => {
  const res = await request(app).get('/api/home-chef/recipes');
  expect(res.status).toEqual(200);
});

it('posts a recipe', async () => {
  const token = await global.getToken({ admin: true });
  const res = await request(app)
    .post('/api/home-chef/recipe')
    .set('Authorization', token)
    .field('name', 'bacon')
    .field('ingredients', 'pig')
    .field('description', 'a recipe from the old country')
    .field('instructions', 'fry it up!')
    // .attach('image', 'src/routes/textService/__test__/photo.jpeg')
    .expect(201);

  expect(res.body.name).toEqual('bacon');
});
