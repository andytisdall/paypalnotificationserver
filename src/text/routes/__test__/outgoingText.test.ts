import app from '../../../../index';
import request from 'supertest';

import { REGIONS } from '../../models/phone';

it('sends an outgoing text', async () => {
  const token = await global.getToken({ admin: true });
  const res = await request(app)
    .post('/api/text/outgoing')
    .set('Authorization', token)
    .field('message', 'There is food available')
    .field('region', 'EAST_OAKLAND')
    .attach('image', 'src/text/routes/__test__/photo.jpeg')
    .expect(200);

  expect(res.body.message).toEqual('There is food available');
});
