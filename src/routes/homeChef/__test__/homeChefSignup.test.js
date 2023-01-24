const app = require('../../../../index.js');
const request = require('supertest');
const { send } = require('@sendgrid/mail');

it('correctly makes the portal user and salesforce contact when the interest form is submitted', async () => {
  const formValues = {
    email: 'test@fake.com',
    firstName: 'Rocky',
    lastName: 'Sanchez',
    phoneNumber: '510-677-6867',
    instagramHandle: '@rockysanchez',
    commit: true,
    foodHandler: false,
    daysAvailable: ['Monday, Wednesday'],
    experience: 'None',
    attend: true,
    pickup: false,
    source: 'Heard about it on the news',
    extraInfo: "I'm super psyched to help!",
  };

  const res = await request(app)
    .post('/api/home-chef/signup')
    .send(formValues)
    .expect(201);

  expect(send).toHaveBeenCalled();
});
