import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import '../auth/models/user';
import '../mealProgram/models/restaurant';
import getSecrets from '../utils/getSecrets';

declare global {
  function getToken({ admin }: { admin: boolean }): Promise<string>;
  function signIn(username: string): Promise<string>;
}

jest.mock('@sendgrid/mail');
jest.mock('twilio');

global.getToken = async ({ admin }: { admin: boolean }) => {
  const User = mongoose.model('User');
  const userInfo = {
    username: 'test',
    password: 'password',
    salesforceId: '0037900000DX4noAAD',
    admin,
  };
  const newUser = new User(userInfo);
  await newUser.save();
  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw new Error('No JWT key found');
  }
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
  // put your client connection code here, example with mongoose:
  const uri = process.env['MONGO_URI'];
  if (!uri) {
    throw new Error('could not fing mongo memory server uri');
  }
  mongoose.connect(uri);
});

afterEach(async () => {
  const User = mongoose.model('User');
  await User.deleteMany();
});

afterAll(async () => {
  // put your client disconnection code here, example with mongodb:
  await mongoose.disconnect();
});
