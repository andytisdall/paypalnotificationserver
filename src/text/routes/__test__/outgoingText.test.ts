import app from "../../../../index";
import request from "supertest";
import mongoose from "mongoose";

const Phone = mongoose.model("Phone");
const OutgoingTextRecord = mongoose.model("OutgoingTextRecord");

const TIMEOUT = 200;

it("sends an outgoing text with attached photo", async () => {
  const newBerkeleySubscriber = new Phone({
    number: "test_berkeley",
    region: ["BERKELEY"],
  });
  const newWestOaklandSubscriber = new Phone({
    number: "test_west_oakland",
    region: ["WEST_OAKLAND", "EAST_OAKLAND"],
  });
  const newEastOaklandSubscriber = new Phone({
    number: "test_east_oakland",
    region: ["EAST_OAKLAND", "BERKELEY"],
  });
  const newResourcesSubscriber = new Phone({
    number: "test_resources",
    region: ["RESOURCES"],
  });
  await newBerkeleySubscriber.save();
  await newWestOaklandSubscriber.save();
  await newEastOaklandSubscriber.save();
  await newResourcesSubscriber.save();

  const token = await global.getToken({ admin: true });

  const message = "There is food available in East Oakland";
  const res = await request(app)
    .post("/api/text/outgoing")
    .set("Authorization", token)
    .set("Content-Type", "multipart/form-data")
    .field("message", message)
    .field("region", "EAST_OAKLAND")
    .attach("photo", "src/text/routes/__test__/photo.jpeg")
    .expect(200);

  expect(res.body.message).toEqual(message);
  expect(res.body.photoUrl).toBeDefined();
  expect(res.body.region).toEqual("EAST_OAKLAND");

  await new Promise((resolve) => setTimeout(resolve, TIMEOUT));

  const textRecord = await OutgoingTextRecord.findOne({ message });
  const eastOaklandSubscribers = await Phone.find({ region: "EAST_OAKLAND" });
  expect(textRecord?.sendCount).toEqual(eastOaklandSubscribers.length);
});

it("sends an outgoing text with image url", async () => {
  const token = await global.getToken({ admin: true });

  const message = "There is food available now in West Oakland";
  const res = await request(app)
    .post("/api/text/outgoing")
    .set("Authorization", token)
    .set("Content-Type", "multipart/form-data")
    .field("message", message)
    .field("region", "west oakland")
    .field("photo", "https://m.media-amazon.com/images/I/918YNa3bAaL.jpg")
    .expect(200);

  expect(res.body.message).toEqual(message);
  expect(res.body.photoUrl).toEqual(
    "https://m.media-amazon.com/images/I/918YNa3bAaL.jpg",
  );
  expect(res.body.region).toEqual("WEST_OAKLAND");

  await new Promise((resolve) => setTimeout(resolve, TIMEOUT));

  const textRecord = await OutgoingTextRecord.findOne({ message });
  const westOaklandSubscribers = await Phone.find({
    region: "WEST_OAKLAND",
  });
  expect(textRecord?.sendCount).toEqual(westOaklandSubscribers.length);
});

it("sends an outgoing text to all subscribers", async () => {
  const token = await global.getToken({ admin: false });

  const message = "There is food available at the CK Kitchen";
  const res = await request(app)
    .post("/api/text/outgoing")
    .set("Authorization", token)
    .set("Content-Type", "multipart/form-data")
    .field("message", message)
    .field("region", "all")
    .expect(200);

  expect(res.body.message).toEqual(message);
  expect(res.body.photoUrl).not.toBeDefined();
  expect(res.body.region).toEqual("ALL");

  await new Promise((resolve) => setTimeout(resolve, TIMEOUT));

  const textRecord = await OutgoingTextRecord.findOne({ message });
  const allSubscribers = await Phone.find({ region: { $ne: [] } });
  expect(textRecord?.sendCount).toEqual(allSubscribers.length);
});

it("sends an outgoing text to one phone number", async () => {
  const token = await global.getToken({ admin: false });

  const message = "I'm responding to your feedback";
  const res = await request(app)
    .post("/api/text/outgoing")
    .set("Authorization", token)
    .set("Content-Type", "multipart/form-data")
    .field("message", message)
    .field("region", "berkeley")
    .field("number", "4158190251")
    .expect(200);

  expect(res.body.message).toEqual(message);
  expect(res.body.number).toEqual("4158190251");

  await Phone.deleteMany();
});
