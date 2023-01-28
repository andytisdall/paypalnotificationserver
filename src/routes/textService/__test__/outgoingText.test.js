const app = require('../../../../index.js');
const request = require('supertest');

const { REGIONS } = require('../../../models/phone');

it('sends an outgoing text', async () => {
  const token = await global.getToken({ admin: true });
  const res = await request(app)
    .post('/api/text/outgoing')
    .set('Authorization', token)
    .send({
      message: 'There is food available',
      region: REGIONS.EAST_OAKLAND,
    })
    .expect(200);

  expect(res.body.message).toEqual('There is food available');
});
