import fetcher from "../../fetcher";
import urls from "../../urls";

export interface MealSurveyArgsV3 {
  language: "English";
  age?: string;
  ethnicity?: string;
  preferredLanguage?: string;
  otherPreferredLanguage?: string;
  zip?: string;
  numberOfPeople?: string;
  children?: string;
  homelessness?: string;
  homelessnessOther?: string;
  cookingItems?: string[];
  cookingItemsOther?: string;
  healthConcerns?: string[];
  dietary?: string[];
  dietaryOther?: string;
  fruit?: string;
  favorites?: Favorites;
  calfresh?: string;
  resources?: string[];
  rating?: string;
  skip?: string;
  location?: string;
  access?: string;
}

export interface MealSurveyDataV3 {
  Language__c: "English";
  Age__c?: string;
  Ethnicity__c?: string;
  Preferred_Language__c?: string;
  Other_Preferred_Language__c?: string;
  Zip_Code__c?: string;
  Household_Size__c?: string;
  Children_under_5__c?: string;
  Unhoused__c?: string;
  Unhoused_Other__c?: string;
  CookingItems__c?: string;
  CookingItemsOther__c?: string;
  Health_Concerns__c?: string;
  Dietary_Preferences__c?: string;
  Fruit_Wanted__c?: string;
  Food_American__c?: number;
  Food_Asian__c?: number;
  Food_BBQ__c?: number;
  Food_Italian__c?: number;
  Food_Mexican__c?: number;
  Food_Sandwiches__c?: number;
  Food_Southern__c?: number;
  Enrolled_in_Calfresh__c?: string;
  Helpful_Resouces__c?: string;
  Meal_Rating__c?: string;
  Skip_a_Meal__c?: string;
  Meal_Sources__c?: string;
  Access_to_Healthy_Meals__c?: string;
}

const joinArray = (array?: string[]) => {
  return array?.join(";");
};

interface Favorites {
  american: number;
  asian: number;
  bbq: number;
  italian: number;
  mexican: number;
  sandwiches: number;
  southern: number;
}

export const submitMealSurveyDataV3 = async (data: MealSurveyArgsV3) => {
  await fetcher.setService("salesforce");

  const { american, asian, bbq, italian, mexican, sandwiches, southern } =
    data.favorites ? data.favorites : {};

  const surveyData: MealSurveyDataV3 = {
    Language__c: data.language,
    Age__c: data.age,
    Ethnicity__c: data.ethnicity,
    Preferred_Language__c: data.preferredLanguage,
    Other_Preferred_Language__c: data.otherPreferredLanguage,
    Zip_Code__c: data.zip,
    Household_Size__c: data.numberOfPeople,
    Children_under_5__c: data.children,
    Unhoused__c: data.homelessness,
    UnhousedOther__c: data.homelessnessOther,
    CookingItems__c: joinArray(data.cookingItems),
    CookingItemsOther__c: data.cookingItemsOther,
    Health_Concerns__c: joinArray(data.healthConcerns),
    Dietary_Preferences__c: joinArray(data.dietary),
    Fruit_Wanted__c: data.fruit,
    Food_American__c: american,
    Food_Asian__c: asian,
    Food_BBQ__c: bbq,
    Food_Italian__c: italian,
    Food_Mexican__c: mexican,
    Food_Sandwiches__c: sandwiches,
    Food_Southern__c: southern,
    Enrolled_in_Calfresh__c: data.calfresh,
    Helpful_Resouces__c: joinArray(data.resources),
    Meal_Rating__c: data.rating,
    Skip_a_Meal__c: data.skip,
    Meal_Sources__c: data.location,
    Access_to_Healthy_Meals__c: data.access,
  };

  const insertUri = urls.SFOperationPrefix + "/Meal_Survey_Data_3__c";
  const response = await fetcher.post(insertUri, surveyData);

  if (!response.data.success) {
    throw new Error("Could not save the survey results");
  }
};
