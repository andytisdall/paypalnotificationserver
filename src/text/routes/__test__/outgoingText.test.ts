import app from "../../../../index";
import request from "supertest";
import mongoose from "mongoose";

const Phone = mongoose.model("Phone");

it("sends an outgoing text with attached photo", async () => {
  const newBerkeleySubscriber = new Phone({
    number: "test_berkeley",
    region: ["BERKELEY"],
  });
  const newWestOaklandSubscriber = new Phone({
    number: "test_west_oakland",
    region: ["WEST_OAKLAND"],
  });
  const newEastOaklandSubscriber = new Phone({
    number: "test_east_oakland",
    region: ["EAST_OAKLAND"],
  });
  await newBerkeleySubscriber.save();
  await newWestOaklandSubscriber.save();
  await newEastOaklandSubscriber.save();

  const token = await global.getToken({ admin: true });
  const res = await request(app)
    .post("/api/text/outgoing")
    .set("Authorization", token)
    .set("Content-Type", "multipart/form-data")
    .field("message", "There is food available")
    .field("region", "EAST_OAKLAND")
    .attach("photo", "src/text/routes/__test__/photo.jpeg")
    .expect(200);

  expect(res.body.message).toEqual("There is food available");
  expect(res.body.photoUrl).toBeDefined();
  expect(res.body.region).toEqual("EAST_OAKLAND");
});

it("sends an outgoing text with image url", async () => {
  const token = await global.getToken({ admin: true });
  const res = await request(app)
    .post("/api/text/outgoing")
    .set("Authorization", token)
    .set("Content-Type", "multipart/form-data")
    .field("message", "There is food available")
    .field("region", "west oakland")
    .field("photo", "https://m.media-amazon.com/images/I/918YNa3bAaL.jpg")
    .expect(200);

  expect(res.body.message).toEqual("There is food available");
  expect(res.body.photoUrl).toEqual(
    "https://m.media-amazon.com/images/I/918YNa3bAaL.jpg",
  );
  expect(res.body.region).toEqual("WEST_OAKLAND");
});

it("sends an outgoing text to all subscribers", async () => {
  const token = await global.getToken({ admin: false });
  const res = await request(app)
    .post("/api/text/outgoing")
    .set("Authorization", token)
    .set("Content-Type", "multipart/form-data")
    .field("message", "There is food available")
    .field("region", "all")
    .expect(200);

  expect(res.body.message).toEqual("There is food available");
  expect(res.body.photoUrl).not.toBeDefined();
  expect(res.body.region).toEqual("ALL");
});

it("sends an outgoing text to one phone number", async () => {
  const token = await global.getToken({ admin: false });
  const res = await request(app)
    .post("/api/text/outgoing")
    .set("Authorization", token)
    .set("Content-Type", "multipart/form-data")
    .field("message", "There is food available")
    .field("region", "berkeley")
    .field("number", "4158190251")

    .expect(200);

  expect(res.body.message).toEqual("There is food available");
  expect(res.body.number).toEqual("4158190251");
});
