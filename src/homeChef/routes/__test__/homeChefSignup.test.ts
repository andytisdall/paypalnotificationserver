import app from '../../../../index';
import request from 'supertest';
import mongoose from 'mongoose';

const User = mongoose.model('User');

jest.mock('@sendgrid/mail');

afterEach(async () => {
  await User.deleteOne({ username: 'rsanchez' });
});

it('correctly makes the portal user and salesforce contact when the interest form is submitted', async () => {
  const formValues = {
    email: 'fake@gogo.com',
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
  expect(user?.salesforceId).toBeDefined();
});

it('correctly updates an existing contact and makes a user when the interest form is submitted', async () => {
  const formValues = {
    email: 'andrew.tisdall@gmail.com',
    firstName: 'Testy',
    lastName: 'Test',
    phoneNumber: '510-677-6867',
    instagramHandle: '@joejoe',
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

  const user = await User.findOne({ username: 'ttest' });

  expect(user).toBeDefined();
  expect(user?.salesforceId).toBeDefined();
});

// it('migrates existing users into the portal', async () => {
//   await migrate();
//   const user = await User.findOne({ username: 'rsanchez' });
//   expect(user?.username).toEqual('rsanchez');
// });
