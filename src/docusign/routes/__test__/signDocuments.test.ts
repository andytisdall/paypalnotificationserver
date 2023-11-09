import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../../..';

const User = mongoose.model('User');
const Restaurant = mongoose.model('Restaurant');

it('gets a redirect url from the sign documents route', async () => {
  const token = await global.getToken({ admin: false });
  await request(app)
    .get('/api/docusign/sign/DD')
    .set('Authorization', token)
    .expect(200);
});

it('uploads a file from docusign to salesforce for both contact and restaurant accounts', async () => {
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

  const newRest = new Restaurant({
    name: 'Paddys',
    salesforceId: '0017400000IGCdtAAH',
    user: user.id,
  });
  await newRest.save();

  await request(app)
    .post('/api/docusign/getDoc')
    .send({
      envelopeId,
      doc: 'DD',
    })
    .set('Authorization', token)
    .expect(201);
});
