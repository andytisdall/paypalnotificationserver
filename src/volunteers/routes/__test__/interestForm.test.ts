import app from "../../../../index";
import request from "supertest";
import mongoose from "mongoose";
import passwordGenerator from "generate-password";
import {
  getContactByEmail,
  updateContact,
} from "../../../utils/salesforce/SFQuery/contact/contact";

const User = mongoose.model("User");

jest.mock("@sendgrid/mail");

afterEach(async () => {
  await User.deleteOne({ username: "rsanchez" });
});

it("correctly makes the portal user and salesforce contact when the interest form is submitted", async () => {
  const lastName = passwordGenerator.generate({
    length: 10,
    uppercase: false,
  });

  const formValues = {
    email: "hello@gmail.com",
    firstName: "Maybe",
    lastName,
    phoneNumber: "415-819-0251",
    instagramHandle: "@instagream",
    source: "Newspaper",
    extraInfo: "I love cooking",
    corporate: true,
  };

  await request(app)
    .post("/api/volunteers/signup")
    .send(formValues)
    .expect(204);

  const user = await User.findOne({ username: "m" + lastName });
  expect(user).not.toBeNull();
  expect(user?.salesforceId).toBeDefined();
});

it("correctly updates an existing contact and makes a user when the interest form is submitted", async () => {
  const email = "andrew.tisdall@gmail.com";

  const formValues = {
    email,
    firstName: "Testy",
    lastName: "Test",
    phoneNumber: "510-677-6867",
    instagramHandle: "@joejoe",
    source: "Heard about it on the news",
    extraInfo: "I'm super psyched to help!",
    corporate: false,
  };

  await request(app)
    .post("/api/volunteers/signup")
    .send(formValues)
    .expect(204);

  const user = await User.findOne({ username: "ttest" });

  expect(user).not.toBeNull();
  expect(user?.salesforceId).toBeDefined();

  await updateContact(user.salesforceId, { Portal_Username__c: "" });
});
