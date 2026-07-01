import app from "../../../../index";
import request from "supertest";
import { MealSurveyArgsV3 } from "../../../utils/salesforce/mealProgram/types";

it("submits a report", async () => {
  const formValues: MealSurveyArgsV3 = {
    language: "English",
    age: "18-26",
    ethnicity: "Black or African American",
    preferredLanguage: "Other:",
    otherPreferredLanguage: "Mam",
    zip: "94112",
    numberOfPeople: "5+",
    children: "No",
    homelessness: "Yes",
    homelessnessOther: "Something",
    cookingItems: ["Refrigerator", "Stove/Oven", "Other:", "None of the Above"],
    cookingItemsOther: "Blender",
    healthConcerns: ["Prefer not to answer", "Type II Diabetes"],
    dietary: ["No Beef", "Nut Allergy/sensitivity", "None"],
    dietaryOther: "No brown M&Ms",
    fruit: "No",
    favorites: {
      American: 1,
      "Asian Cuisine": 2,
      Barbecue: 3,
      Italian: 5,
      Mexican: 4,
      Sandwiches: 6,
      "Southern/ Soul": 7,
    },
    calfresh: "Yes, I am enrolled",
    resources: ["Dry/canned food", "Housing Navigation", "Socks", "Water"],
    resourcesOther: "Cheerios",
    rating: "Poor",
    skip: "2-3 times a week",
    location: ["Other:"],
    locationOther: "Store",
    access: "Strongly Disagree",
  };

  await request(app)
    .post("/api/meal-program/survey3")
    .send(formValues)
    .expect(204);
});

it("submits a report", async () => {
  const formValues: MealSurveyArgsV3 = {
    language: "Spanish",
    age: "75+",
    ethnicity: "Prefer not to answer",
    preferredLanguage: "Chinese (Cantonese or Mandarin)",
    otherPreferredLanguage: "",
    zip: "kugjl",
    numberOfPeople: "1",
    children: "Yes",
    homelessness: "Other:",
    homelessnessOther: "",
    cookingItems: ["Other:"],
    cookingItemsOther: "",
    healthConcerns: ["Food allergies", "Mobility limitations", "Other"],
    dietary: ["Other:", "Vegetarian/Vegan"],
    dietaryOther: "",
    fruit: "Yes",
    favorites: {
      American: 7,
      "Asian Cuisine": 5,
      Barbecue: 1,
      Italian: 3,
      Mexican: 4,
      Sandwiches: 2,
      "Southern/ Soul": 6,
    },
    calfresh: "No, I am not interested in enrolling",
    resources: ["Other:"],
    resourcesOther: "",
    rating: "I haven't tried any yet",
    skip: "Rarely",
    location: ["Town Fridges", "CK Central Kitchen's Doorfront Distribution"],
    locationOther: "",
    access: "Neutral",
  };

  await request(app)
    .post("/api/meal-program/survey3")
    .send(formValues)
    .expect(204);
});
