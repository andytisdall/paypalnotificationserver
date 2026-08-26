import app from "../../../../index";
import request from "supertest";

import { mockUser } from "../../../test/setup";
import urls from "../../../utils/urls";

it("gets volunteer shifts and jobs", async () => {
  const response = await request(app).get(
    "/api/volunteers/jobs/" + urls.ckKitchenCampaignId,
  );

  const jobList = response.body;
  expect(jobList).not.toHaveLength(0);

  const job = jobList[0];
  expect(job).toHaveProperty("campaign");
  expect(job.shifts).not.toHaveLength(0);

  const shift = job.shifts[0];
  expect(shift).toHaveProperty("startTime");
  expect(shift.job).toEqual(job.id);

  await getToken({ admin: false });

  const shiftForSignup = job.shifts.find((sh: any) => sh.open);

  const newHours1 = {
    shiftId: shiftForSignup.id,
    jobId: job.id,
    date: shiftForSignup.startTime,
    contactSalesforceId: mockUser.salesforceId,
  };
  await request(app).post("/api/volunteers/hours").send(newHours1).expect(201);

  const reservedShift = job.shifts.find((sh: any) => sh.reservedShift);
  if (reservedShift) {
    const newHours2 = {
      shiftId: reservedShift.id,
      jobId: job.id,
      date: reservedShift.startTime,
      contactSalesforceId: mockUser.salesforceId,
    };
    await request(app)
      .post("/api/volunteers/hours/reserved")
      .send(newHours2)
      .expect(201);
  }
});
