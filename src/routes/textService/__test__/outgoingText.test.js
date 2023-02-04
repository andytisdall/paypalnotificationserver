const app = require('../../../../index.js');
const request = require('supertest');

const { REGIONS } = require('../../../models/phone');

it('sends an outgoing text', async () => {
  const token = await global.getToken({ admin: true });
  const res = await request(app)
    .post('/api/text/outgoing')
    .set('Authorization', token)
    .field('message', 'There is food available')
    .field('region', REGIONS.EAST_OAKLAND)
    .attach('image', 'src/routes/textService/__test__/photo.jpg')
    .expect(200);

  expect(res.body.message).toEqual('There is food available');
});
