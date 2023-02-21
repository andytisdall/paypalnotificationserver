import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../../..';

const User = mongoose.model('User');
const Restaurant = mongoose.model('Restaurant');

it('gets a redirect url from the sign documents route', async () => {
  const token = await global.getToken({ admin: false });
  await request(app)
    .post('/api/docusign/sign')
    .send({ accountType: 'contact' })
    .set('Authorization', token)
    .expect(200);
});

it('uploads a file from docusign to salesforce for both contact and restaurant accounts', async () => {
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

  const newRest = new Restaurant({
    name: 'Paddys',
    salesforceId: '0017900000IR3X0AAL',
    user: user.id,
  });
  await newRest.save();

  await request(app)
    .post('/api/docusign/getDoc')
    .send({
      envelopeId,
      accountType: 'restaurant',
      accountId: newRest.id,
    })
    .set('Authorization', token)
    .expect(201);
});
