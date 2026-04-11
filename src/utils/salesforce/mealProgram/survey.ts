import { MealSurveyArgs, MealSurveyData } from "./types";
import fetcher from "../../fetcher";
import urls from "../../urls";

const getStringFromBoolean = (bool?: boolean) =>
  bool === true ? "Yes" : bool === false ? "No" : bool;

export const submitMealSurveyData = async (data: MealSurveyArgs) => {
  await fetcher.setService("salesforce");

  const surveyData: MealSurveyData = {
    Language__c: data.language,
    Age__c: data.age,
    Ethnicity__c: data.ethnicity,
    Zip_Code__c: data.zip,
    Access_to_Microwave__c: getStringFromBoolean(data.microwave),
    Access_to_Utensils__c: getStringFromBoolean(data.utensils),
    Children_under_10__c: getStringFromBoolean(data.children),
    How_many_people_served__c: data.numberOfPeople,
    Favorite_Food__c: data.mealType,
    Favorite_Food_2__c: data.mealType2,
    Dietary_Preferences__c: data.dietary?.join(";"),
    Enjoying_Meals__c: getStringFromBoolean(data.taste),
    Fruit_Wanted__c: getStringFromBoolean(data.fruit),
    Town_fridge_access_time_of_day__c: data.time,
    Access_to_Healthy_Meals__c: getStringFromBoolean(data.access),
    Skip_a_Meal__c: data.skip,
    Access_to_Refrigerator__c: getStringFromBoolean(data.fridge),
    Diabetic__c: getStringFromBoolean(data.diabetes),
    High_Blood_Pressure__c: getStringFromBoolean(data.hbp),
  };

  const insertUri = urls.SFOperationPrefix + "/Meal_Survey_Data_2__c";
  const response = await fetcher.post(insertUri, surveyData);

  if (!response.data.success) {
    throw new Error("Could not save the survey results");
  }
};
