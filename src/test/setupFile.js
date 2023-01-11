const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const getSecrets = require('../services/getSecrets.js');
const { User } = require('../models/user');

global.getToken = async ({ admin }) => {
  const userInfo = {
    username: 'test',
    password: 'password',
    salesforceId: '4f9f9ojf4',
    householdId: '4rf3f34f',
    admin,
  };
  const newUser = new User(userInfo);
  await newUser.save();
  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  return jwt.sign(
    {
      id: newUser.id,
    },
    JWT_KEY
  );
};

beforeAll(() => {
  // put your client connection code here, example with mongoose:
  mongoose.connect(process.env['MONGO_URI']);
});

afterAll(async () => {
  // put your client disconnection code here, example with mongodb:
  await mongoose.disconnect();
});
