const app = require('../../../index.js');
const request = require('supertest');

const textResponses = require('../../services/textResponses');
const { Phone, REGIONS } = require('../../models/phone');

const from = '+14158190251';

it('signs up for west oakland', async () => {
  const incomingText = {
    Body: 'signup',
    From: from,
    To: REGIONS['WEST_OAKLAND'],
  };
  const res = await request(app)
    .post('/api/text/incoming')
    .send(incomingText)
    .expect(200);
  expect(res.text).toEqual(textResponses.signUpResponse('WEST_OAKLAND'));
});

it('signs up for east oakland', async () => {
  const incomingText = {
    Body: 'signup',
    From: from,
    To: REGIONS['EAST_OAKLAND'],
  };
  const res = await request(app)
    .post('/api/text/incoming')
    .send(incomingText)
    .expect(200);
  expect(res.text).toEqual(textResponses.signUpResponse('EAST_OAKLAND'));
});

it('gets a duplicate response', async () => {
  const incomingText = {
    Body: 'signup',
    From: from,
    To: REGIONS['EAST_OAKLAND'],
  };
  const res = await request(app)
    .post('/api/text/incoming')
    .send(incomingText)
    .expect(200);
  expect(res.text).toEqual(textResponses.duplicateResponse('EAST_OAKLAND'));
});

it('unsubscribes', async () => {
  const number = await Phone.findOne({ number: from });
  expect(number.region.length).toEqual(2);
  const cancelText = {
    Body: 'stop',
    From: from,
    To: REGIONS['EAST_OAKLAND'],
  };
  await request(app).post('/api/text/incoming').send(cancelText);
  const updatedNumber = await Phone.findOne({ number: from });
  expect(updatedNumber.region.length).toEqual(1);
});
