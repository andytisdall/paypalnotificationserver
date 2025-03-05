import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../..';

const User = mongoose.model('User');

it('gets a redirect url from the sign documents route', async () => {
  const token = await global.getToken({ admin: false });
  const [user] = await User.find();

  await request(app)
    .get('/api/sign/HC/' + user.salesforceId)
    .set('Authorization', token)
    .expect(200);
});

it.skip('uploads a file from docusign to salesforce for both contact and restaurant accounts', async () => {
  const token = await global.getToken({ admin: false });
  const envelopeId = 'b84b318d-4fa8-4d6e-a0dc-4689564192fc';
  const [user] = await User.find();
  await request(app)
    .post('/api/docusign/getDoc')
    .send({
      envelopeId,
      doc: 'HC',
      email: 'andrew.tisdall@gmail.com',
    })
    .expect(201);
});
