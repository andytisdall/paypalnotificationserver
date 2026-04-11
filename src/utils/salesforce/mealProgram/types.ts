export interface MealSurveyArgs {
  language: "English" | "Spanish";
  age?: string;
  ethnicity?: string;
  zip?: string;
  microwave?: boolean;
  utensils?: boolean;
  numberOfPeople?: string;
  children?: boolean;
  time?: string;
  mealType?: string;
  mealType2?: string;
  dietary?: string[];
  fruit?: boolean;
  taste?: boolean;
  access?: boolean;
  skip?: string;
  fridge?: boolean;
  diabetes?: boolean;
  hbp?: boolean;
}

export interface MealSurveyData {
  Language__c: "English" | "Spanish";
  Age__c?: string;
  Ethnicity__c?: string;
  Zip_Code__c?: string;
  Access_to_Microwave__c?: YesOrNo;
  Access_to_Utensils__c?: YesOrNo;
  How_many_people_served__c?: string;
  Children_under_10__c?: YesOrNo;
  Town_fridge_access_time_of_day__c?: string;
  Favorite_Food__c?: string;
  Favorite_Food_2__c?: string;
  Dietary_Preferences__c?: string;
  Fruit_Wanted__c?: YesOrNo;
  Enjoying_Meals__c?: YesOrNo;
  Access_to_Healthy_Meals__c?: YesOrNo;
  Skip_a_Meal__c?: string;
  Access_to_Refrigerator__c?: YesOrNo;
  Diabetic__c?: YesOrNo;
  High_Blood_Pressure__c?: YesOrNo;
}

type YesOrNo = "Yes" | "No";

export interface MealsPlusService {
  Name: string;
  CBO_Name__c: string;
  Location__c: string;
  Time__c: string;
  Instructions__c?: string;
  Description__c?: string;
  Contact__c: string;
}

export interface MealsPlusArgs {
  name: string;
  cbo: string;
  location: string;
  time: string;
  instructions?: string;
  description?: string;
  contactId: string;
}

export interface NewMobileOasisDelivery {
  fridge: string;
  numberOfMealsMeat: number;
  numberOfMealsVeg: number;
}

export interface UnformattedMealDelivery {
  Date__c: string;
  CBO__c: string;
  Restaurant__c: string;
  Id?: string;
  Time__c?: string;
  TextTime__c?: string;
  Delivery_Method__c: string;
  Number_of_Meals_Meat__c: number;
  Number_of_Meals_Veg__c: number;
  Delivery_Notes__c: string;
  Price_Per_Meal__c?: number;
  Is_This_Week__c?: boolean;
  Is_Next_Week__c?: boolean;
  Funding_Source__c?: string;
}
