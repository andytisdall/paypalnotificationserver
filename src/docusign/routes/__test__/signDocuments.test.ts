import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../../..';

const User = mongoose.model('User');

it('gets a redirect url from the sign documents route', async () => {
  const token = await global.getToken({ admin: false });
  await request(app)
    .post('/api/docusign/sign')
    .send({ accountType: 'contact' })
    .set('Authorization', token)
    .expect(200);
});

it('uploads a file from docusign to salesforce', async () => {
  const token = await global.getToken({ admin: false });
  const envelopeId = 'b84b318d-4fa8-4d6e-a0dc-4689564192fc';
  const [user] = await User.find();
  const accountId = user.id;
  await request(app)
    .post('/api/docusign/getDoc')
    .send({
      envelopeId,
      accountType: 'contact',
      accountId,
    })
    .set('Authorization', token)
    .expect(201);
});
