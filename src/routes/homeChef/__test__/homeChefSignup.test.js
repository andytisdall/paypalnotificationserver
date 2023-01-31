const app = require('../../../../index.js');
const request = require('supertest');
const { send } = require('@sendgrid/mail');
const { User } = require('../../../models/user');

const migrate = require('../../../services/salesforce/migrateVolunteers');

afterEach(async () => {
  await User.deleteOne({ username: 'rsanchez' });
});

it('correctly makes the portal user and salesforce contact when the interest form is submitted', async () => {
  const formValues = {
    email: 'test@fake.com',
    firstName: 'Rocky',
    lastName: 'Sanchez',
    phoneNumber: '510-677-6867',
    instagramHandle: '@rockysanchez',
    commit: true,
    foodHandler: false,
    daysAvailable: {
      Monday: true,
      Tuesday: false,
      Wednesday: true,
      Thursday: false,
    },
    experience: 'None',
    attend: true,
    pickup: false,
    source: 'Heard about it on the news',
    extraInfo: "I'm super psyched to help!",
  };

  await request(app).post('/api/home-chef/signup').send(formValues).expect(201);

  const user = await User.findOne({ username: 'rsanchez' });
  expect(user).toBeDefined();

  expect(send).toHaveBeenCalled();
});

it('migrates existing users into the portal', async () => {
  await migrate();
  const user = await User.findOne({ username: 'rsanchez' });
  expect(user.username).toEqual('rsanchez');
});
