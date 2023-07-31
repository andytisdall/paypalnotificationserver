import app from '../../../../index';
import request from 'supertest';

it('sends an outgoing text with attached photo', async () => {
  const token = await global.getToken({ admin: true });
  const res = await request(app)
    .post('/api/text/outgoing')
    .set('Authorization', token)
    .set('Content-Type', 'multipart/form-data')
    .field('message', 'There is food available')
    .field('region', 'EAST_OAKLAND')
    .attach('photo', 'src/text/routes/__test__/photo.jpeg')
    .expect(200);

  expect(res.body.message).toEqual('There is food available');
  expect(res.body.photoUrl).toBeDefined();
  expect(res.body.region).toEqual('EAST_OAKLAND');
});

it('sends an outgoing text with image url', async () => {
  const token = await global.getToken({ admin: true });
  const res = await request(app)
    .post('/api/text/outgoing')
    .set('Authorization', token)
    .set('Content-Type', 'multipart/form-data')
    .field('message', 'There is food available')
    .field('region', 'WEST_OAKLAND')
    .field('photo', 'https://m.media-amazon.com/images/I/918YNa3bAaL.jpg')
    .expect(200);

  expect(res.body.message).toEqual('There is food available');
  expect(res.body.photoUrl).toEqual(
    'https://m.media-amazon.com/images/I/918YNa3bAaL.jpg'
  );
  expect(res.body.region).toEqual('WEST_OAKLAND');
});
