import app from "../../../../index";
import request from "supertest";
import mongoose from "mongoose";

import textResponses from "../../textResponses";
import { Phone, REGIONS } from "../../models/phone";

const Feedback = mongoose.model("Feedback");

jest.mock("twilio");

const from = "PHONE_NUMBER";

it("gets general info", async () => {
  const incomingText = {
    Body: "What Up?",
    From: from,
    To: REGIONS["WEST_OAKLAND"],
  };
  const res = await request(app)
    .post("/api/text/incoming")
    .send(incomingText)
    .expect(200);
  expect(res.text).toEqual(textResponses.generalInfoResponse("WEST_OAKLAND"));
});

it("signs up for west oakland", async () => {
  const incomingText = {
    Body: "signup",
    From: from,
    To: REGIONS["WEST_OAKLAND"],
  };
  const res = await request(app)
    .post("/api/text/incoming")
    .send(incomingText)
    .expect(200);
  expect(res.text).toEqual(textResponses.signUpResponse("WEST_OAKLAND"));
});

it("signs up for east oakland", async () => {
  const incomingText = {
    Body: "signup",
    From: from,
    To: REGIONS["EAST_OAKLAND"],
  };
  const res = await request(app)
    .post("/api/text/incoming")
    .send(incomingText)
    .expect(200);
  expect(res.text).toEqual(textResponses.signUpResponse("EAST_OAKLAND"));
});

it("gets a duplicate response", async () => {
  const incomingText = {
    Body: "signup",
    From: from,
    To: REGIONS["EAST_OAKLAND"],
  };
  const res = await request(app)
    .post("/api/text/incoming")
    .send(incomingText)
    .expect(200);
  expect(res.text).toEqual(textResponses.duplicateResponse("EAST_OAKLAND"));
});

it("texts feedback", async () => {
  const message = "The meals are delicious";
  const incomingText = {
    Body: message,
    From: from,
    To: REGIONS["WEST_OAKLAND"],
  };
  const res = await request(app)
    .post("/api/text/incoming")
    .send(incomingText)
    .expect(200);
  expect(res.text).toEqual(textResponses.feedbackResponse());

  // check for feedback record in db
  const fb = await Feedback.findOne({
    message,
    region: "WEST_OAKLAND",
    sender: from,
  });
  expect(fb).not.toBeUndefined();
});

it("unsubscribes", async () => {
  const number = await Phone.findOne({ number: from });
  expect(number?.region.length).toEqual(2);
  const cancelText = {
    Body: "stop",
    From: from,
    To: REGIONS["EAST_OAKLAND"],
  };
  await request(app).post("/api/text/incoming").send(cancelText);
  const updatedNumber = await Phone.findOne({ number: from });
  expect(updatedNumber?.region.length).toEqual(1);
});

it("un-unsubscribes", async () => {
  const incomingText = {
    Body: "signup",
    From: from,
    To: REGIONS["EAST_OAKLAND"],
  };
  const res = await request(app)
    .post("/api/text/incoming")
    .send(incomingText)
    .expect(200);
  expect(res.text).toEqual(textResponses.signUpResponse("EAST_OAKLAND"));
});
