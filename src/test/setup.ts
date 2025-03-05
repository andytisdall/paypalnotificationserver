import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import "../auth/models/user";
import "../mealProgram/models/restaurant";
import getSecrets from "../utils/getSecrets";
const storeFileGoogle = require("../__mocks__/storeFileGoogle");

declare global {
  function getToken({ admin }: { admin: boolean }): Promise<string>;
  function signIn(username: string): Promise<string>;
  var userId: string;
}

jest.mock("@sendgrid/mail");
jest.mock("twilio");
//@ts-ignore
jest.mock("../files/google/storeFileGoogle", storeFileGoogle);

global.getToken = async ({ admin }: { admin: boolean }) => {
  const User = mongoose.model("User");
  const userInfo = {
    username: "test",
    password: "password",
    salesforceId: "0038Z000035IIhKQAW",
    admin,
  };
  const newUser = new User(userInfo);
  await newUser.save();
  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw new Error("No JWT key found");
  }
  global.userId = newUser.id;
  const Restaurant = mongoose.model("Restaurant");
  const newRestaurant = new Restaurant({
    name: "Vesuvio",
    salesforceId: "0018Z00002lLOweQAG",
    user: newUser.id,
  });
  await newRestaurant.save();
  return jwt.sign(
    {
      id: newUser.id,
    },
    JWT_KEY
  );
};

global.signIn = async (username: string) => {
  const User = mongoose.model("User");
  const user = await User.findOne({ username });
  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw new Error("No JWT key found");
  }
  return jwt.sign(
    {
      id: user.id,
    },
    JWT_KEY
  );
};

beforeAll(() => {
  const uri = process.env["MONGO_URI"];
  if (!uri) {
    throw new Error("could not find mongo memory server uri");
  }
  mongoose.connect(uri);
});

afterEach(async () => {
  const User = mongoose.model("User");
  const Restaurant = mongoose.model("Restaurant");
  await User.deleteMany();
  await Restaurant.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
});
