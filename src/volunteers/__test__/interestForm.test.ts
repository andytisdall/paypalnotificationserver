import app from '../../../index';
import request from 'supertest';
import mongoose from 'mongoose';
import { VolunteerInterestFormArgs } from '../routes/interestForm';

const User = mongoose.model('User');

jest.mock('@sendgrid/mail');

afterEach(async () => {
  await User.deleteOne({ username: 'rsanchez' });
});

it('correctly makes the portal user and salesforce contact when the interest form is submitted', async () => {
  const formValues: VolunteerInterestFormArgs = {
    email: 'hello@gmail.com',
    firstName: 'taybe',
    lastName: 'Funke',
    phoneNumber: '415-819-0251',
    instagramHandle: '@instagream',
    foodHandler: false,
    experience: 'Restaurant',
    source: 'Newspaper',
    extraInfo: 'I love cooking',
    programs: {
      ckKitchen: true,
      ckHomeChefs: false,
      other: 'other',
      corporate: false,
    },
  };

  await request(app)
    .post('/api/volunteers/signup')
    .send(formValues)
    .expect(204);

  const user = await User.findOne({ username: 'tfunke' });
  expect(user).not.toBeNull();
  expect(user?.salesforceId).toBeDefined();
});

it('correctly updates an existing contact and makes a user when the interest form is submitted', async () => {
  const formValues: VolunteerInterestFormArgs = {
    email: 'andrew.tisdall@gmail.com',
    firstName: 'mesty',
    lastName: 'Test',
    phoneNumber: '510-677-6867',
    instagramHandle: '@joejoe',
    foodHandler: false,
    experience: 'Restaurant',
    source: 'Heard about it on the news',
    extraInfo: "I'm super psyched to help!",
    programs: {
      ckKitchen: false,
      ckHomeChefs: true,
      other: '',
      corporate: false,
    },
  };

  await request(app)
    .post('/api/volunteers/signup')
    .send(formValues)
    .expect(204);

  const user = await User.findOne({ username: 'mtest' });

  expect(user).toBeDefined();
  expect(user?.salesforceId).toBeDefined();
});

// it('migrates existing users into the portal', async () => {
//   await migrate();
//   const user = await User.findOne({ username: 'rsanchez' });
//   expect(user?.username).toEqual('rsanchez');
// });
