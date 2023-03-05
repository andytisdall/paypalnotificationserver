import request from 'supertest';
import mongoose from 'mongoose';
import { generate } from 'generate-password';

import app from '../../../..';
import { addContact } from '../../../utils/salesforce/SFQuery';

const User = mongoose.model('User');
const Restaurant = mongoose.model('Restaurant');

// it('gets a redirect url from the sign documents route and uploads a file from docusign to salesforce for both contact and restaurant accounts', async () => {
//   // create unique user and add them in salesforce so they haven't signed anything yet
//   const randomFirstname = generate({
//     length: 5,
//   });
//   const randomLastname = generate({
//     length: 5,
//   });
//   const newContact = await addContact({
//     FirstName: randomFirstname,
//     LastName: randomLastname,
//     Email: 'randomwords@fake.com',
//   });
//   const user = new User({
//     username: randomFirstname,
//     password: randomLastname,
//     salesforceId: newContact.id,
//   });
//   await user.save();
//   const token = await global.signIn(randomFirstname);

//   const { body } = await request(app)
//     .post('/api/docusign/sign')
//     .send({ accountType: 'contact' })
//     .set('Authorization', token)
//     .expect(200);

//   const envelopeId = body.split('envelopeId=')[1].split('&')[0];

//   const accountId = user.id;
//   await request(app)
//     .post('/api/docusign/getDoc')
//     .send({
//       envelopeId,
//       accountType: 'contact',
//       accountId,
//     })
//     .set('Authorization', token)
//     .expect(201);

// const newRest = new Restaurant({
//   name: 'Paddys',
//   salesforceId: '0017900000IR3X0AAL',
//   user: user.id,
// });
// await newRest.save();

// await request(app)
//   .post('/api/docusign/getDoc')
//   .send({
//     envelopeId,
//     accountType: 'restaurant',
//     accountId: newRest.id,
//   })
//   .set('Authorization', token)
//   .expect(201);
// });
