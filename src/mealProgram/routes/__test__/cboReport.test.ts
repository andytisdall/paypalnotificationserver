import app from "../../../../index";
import request from "supertest";

import { CBOReportParams } from "../../../utils/salesforce/cbo/types";

it("submits a report", async () => {
  const formValues: Omit<CBOReportParams, "cboId"> = {
    month: "May",
    year: "2026",
    name: "Andy Tisdall",
    cboName: "Tots for Tots",
    performanceMeasures: {
      withoutAccess: 30,
      lowIncome: 45,
      mealsProvided: 103,
      unusable: 0,
      postcards: 1,
      calfreshApps: 20,
      SSA: 2,
    },
    age: {
      age17: 10,
      age26: 1,
      age49: 10,
      age60: 0,
      ageOver60: 10,
      ageUnknown: 10,
    },
    race: {
      raceAfrican: 20,
      raceLatin: 20,
      raceAsian: 20,
      raceNativeAmerican: 0,
      raceWhite: 20,
      raceDecline: 0,
      raceUnknown: 20,
      raceOther: 20,
      raceOtherText: "other race",
      raceMixed: 20,
      raceMixedText: "",
    },
    individuals: 500,
    households: 487,
    zips: { 94619: 3, 94612: 0, 94607: 50 },
    feedback: "The food was good",
    phoneNumber: "415-819-0251",
    email: "andy@ckoakland.org",
  };

  await request(app).post("/api/meal-program/cbo").send(formValues).expect(204);
});
