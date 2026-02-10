import app from "../../../../index";
import request from "supertest";
import { formatISO } from "date-fns";

import urls from "../../../utils/urls";
import { createShift } from "../../../utils/salesforce/SFQuery/volunteer/shifts";
import { CheckInVolunteer } from "../../../utils/salesforce/SFQuery/volunteer/types";

let shiftId = "";
let contactId = "";
let hoursId = "";

it("creates a new shift and gets a list of shifts for volunteer checkin", async () => {
  const token = await global.getToken({ admin: true });

  shiftId =
    (await createShift({
      jobId: urls.ckKitchenMealPrepJobId,
      date: formatISO(new Date()),
    })) || "";

  const response = await request(app)
    .get("/api/volunteers/check-in/shifts")
    .set("Authorization", token);

  const shiftList = Object.keys(response.body.shifts);
  expect(shiftList).toContain(shiftId);
});

it("gets a list of contacts for volunteer checkin", async () => {
  const token = await global.getToken({ admin: true });

  const response = await request(app)
    .get("/api/volunteers/check-in/" + shiftId)
    .set("Authorization", token);

  expect(response.body).toHaveLength(0);
});

it("gets the volunteer info, creates new volunteer hours for the shift", async () => {
  const token = await global.getToken({ admin: true });

  const response = await request(app).get(
    "/api/volunteers/" + "andy@ckoakland.org",
  );

  const contact = response.body;

  expect(contact.firstName).toEqual("Andrew");

  const { body } = await request(app)
    .post("/api/volunteers/check-in/hours")
    .send({
      contactId: contact.id,
      shiftId: shiftId,
    })
    .set("Authorization", token)
    .expect(200);

  contactId = contact.id;
  hoursId = body.id;
});

it("gets an updated list of contacts for volunteer checkin and finds the hours that were created", async () => {
  const token = await global.getToken({ admin: true });

  const response = await request(app)
    .get("/api/volunteers/check-in/" + shiftId)
    .set("Authorization", token);

  const hours = response.body.find(
    (hours: CheckInVolunteer) => hours.contactId === contactId,
  );

  expect(response.body).toHaveLength(1);
  expect(hours.status).toEqual("Confirmed");
});

it("checks in", async () => {
  const token = await global.getToken({ admin: true });

  await request(app)
    .post("/api/volunteers/check-in")
    .send({ hoursId, duration: 1 })
    .set("Authorization", token)
    .expect(204);

  const response = await request(app)
    .get("/api/volunteers/check-in/" + shiftId)
    .set("Authorization", token);

  const hours: CheckInVolunteer = response.body.find(
    (hours: CheckInVolunteer) => hours.contactId === contactId,
  );

  expect(hours.status).toEqual("Completed");
});
