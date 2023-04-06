import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import '../auth/models/user';
import '../mealProgram/models/restaurant';
import getSecrets from '../utils/getSecrets';

declare global {
  function getToken({ admin }: { admin: boolean }): Promise<string>;
  function signIn(username: string): Promise<string>;
  var userId: string;
}

jest.mock('@sendgrid/mail');
jest.mock('twilio');

global.getToken = async ({ admin }: { admin: boolean }) => {
  const User = mongoose.model('User');
  const userInfo = {
    username: 'test',
    password: 'password',
    salesforceId: '0037900000EfVRIAA3',
    admin,
  };
  const newUser = new User(userInfo);
  await newUser.save();
  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw new Error('No JWT key found');
  }
  global.userId = newUser.id;
  return jwt.sign(
    {
      id: newUser.id,
    },
    JWT_KEY
  );
};

global.signIn = async (username: string) => {
  const User = mongoose.model('User');
  const user = await User.findOne({ username });
  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw new Error('No JWT key found');
  }
  return jwt.sign(
    {
      id: user.id,
    },
    JWT_KEY
  );
};

beforeAll(() => {
  const uri = process.env['MONGO_URI'];
  if (!uri) {
    throw new Error('could not find mongo memory server uri');
  }
  mongoose.connect(uri);
});

afterEach(async () => {
  const User = mongoose.model('User');
  const Restaurant = mongoose.model('Restaurant');
  await User.deleteMany();
  await Restaurant.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
});
