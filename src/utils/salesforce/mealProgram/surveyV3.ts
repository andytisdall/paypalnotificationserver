import fetcher from "../../fetcher";
import urls from "../../urls";
import { MealSurveyArgsV3, MealSurveyDataV3 } from "./types";

const joinArray = (array?: string[]) => {
  return array?.join(";");
};

export const submitMealSurveyDataV3 = async (data: MealSurveyArgsV3) => {
  await fetcher.setService("salesforce");

  const surveyData: MealSurveyDataV3 = {
    Language__c: data.language,
    Age__c: data.age,
    Ethnicity__c: data.ethnicity,
    Preferred_Language__c: data.preferredLanguage,
    Preferred_Language_Other__c: data.otherPreferredLanguage,
    Zip_Code__c: data.zip,
    Household_Size__c: data.numberOfPeople,
    Children_under_5__c: data.children,
    Unhoused__c: data.homelessness,
    Unhoused_Other__c: data.homelessnessOther,
    Cooking_Items__c: joinArray(data.cookingItems),
    Cooking_Items_Other__c: data.cookingItemsOther,
    Health_Concerns__c: joinArray(data.healthConcerns),
    Dietary_Preferences__c: joinArray(data.dietary),
    Dietary_Preferences_Other__c: data.dietaryOther,
    Fruit_Wanted__c: data.fruit,
    Food_American__c: data.favorites.American,
    Food_Asian__c: data.favorites["Asian Cuisine"],
    Food_BBQ__c: data.favorites.Barbecue,
    Food_Italian__c: data.favorites.Italian,
    Food_Mexican__c: data.favorites.Mexican,
    Food_Sandwiches__c: data.favorites.Sandwiches,
    Food_Southern__c: data.favorites["Southern/ Soul"],
    Enrolled_in_Calfresh__c: data.calfresh,
    Helpful_Resources__c: joinArray(data.resources),
    Helpful_Resources_Other__c: data.resourcesOther,
    Meal_Rating__c: data.rating,
    Skip_a_Meal__c: data.skip,
    Meal_Sources__c: joinArray(data.location),
    Meal_Sources_Other__c: data.locationOther,
    Access_to_Healthy_Meals__c: data.access,
  };

  const insertUri = urls.SFOperationPrefix + "/Meal_Survey_Data_V3__c";
  const response = await fetcher.post(insertUri, surveyData);

  if (!response.data.success) {
    throw new Error("Could not save the survey results");
  }
};
