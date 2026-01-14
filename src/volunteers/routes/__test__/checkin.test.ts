import app from "../../../../index";
import request from "supertest";

it("gets a list of shifts for volunteer checkin", async () => {
  const token = await global.getToken({ admin: true });

  const response = await request(app)
    .get("/api/volunteers/check-in/shifts")
    .set("Authorization", token);

  expect(response.body).toHaveLength(1);
});

it("gets a list of contacts for volunteer checkin", async () => {
  const TEST_MEAL_PREP_SHIFT_ID = "a0yTH000005Y9w0YAC";
  const token = await global.getToken({ admin: true });

  const response = await request(app)
    .get("/api/volunteers/check-in/" + TEST_MEAL_PREP_SHIFT_ID)
    .set("Authorization", token);

  expect(response.body).toHaveLength(1);
});
