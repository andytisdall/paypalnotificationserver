import app from "../../../../index";
import request from "supertest";
import { MealSurveyArgs } from "../survey";

it("submits a report", async () => {
  const formValues: MealSurveyArgs = {
    language: "English",
    microwave: true,
    fridge: undefined,
    dietary: ["Vegetarian"],
  };

  await request(app)
    .post("/api/meal-program/survey")
    .send(formValues)
    .expect(204);
});
