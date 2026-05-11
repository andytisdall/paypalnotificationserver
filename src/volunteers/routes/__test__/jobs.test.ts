import app from "../../../../index";
import request from "supertest";

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
});
