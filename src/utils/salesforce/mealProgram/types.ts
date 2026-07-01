interface Favorites {
  American: number;
  "Asian Cuisine": number;
  Barbecue: number;
  Italian: number;
  Mexican: number;
  Sandwiches: number;
  "Southern/ Soul": number;
}

export interface MealSurveyArgsV3 {
  language: "English" | "Spanish" | "Chinese";
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
  favorites: Favorites;
  calfresh?: string;
  resources?: string[];
  resourcesOther?: string;
  rating?: string;
  skip?: string;
  location?: string[];
  locationOther?: string;
  access?: string;
}

export interface MealSurveyDataV3 {
  Language__c: "English" | "Spanish" | "Chinese";
  Age__c?: string;
  Ethnicity__c?: string;
  Preferred_Language__c?: string;
  Preferred_Language_Other__c?: string;
  Zip_Code__c?: string;
  Household_Size__c?: string;
  Children_under_5__c?: string;
  Unhoused__c?: string;
  Unhoused_Other__c?: string;
  Cooking_Items__c?: string;
  Cooking_Items_Other__c?: string;
  Health_Concerns__c?: string;
  Dietary_Preferences__c?: string;
  Dietary_Preferences_Other__c?: string;
  Fruit_Wanted__c?: string;
  Food_American__c?: number;
  Food_Asian__c?: number;
  Food_BBQ__c?: number;
  Food_Italian__c?: number;
  Food_Mexican__c?: number;
  Food_Sandwiches__c?: number;
  Food_Southern__c?: number;
  Enrolled_in_Calfresh__c?: string;
  Helpful_Resources__c?: string;
  Helpful_Resources_Other__c?: string;
  Meal_Rating__c?: string;
  Skip_a_Meal__c?: string;
  Meal_Sources__c?: string;
  Meal_Sources_Other__c?: string;
  Access_to_Healthy_Meals__c?: string;
}

export interface MealsPlusService {
  Name: string;
  CBO_Name__c: string;
  Location__c: string;
  Time__c: string;
  Instructions__c?: string;
  Description__c?: string;
  Contact__c: string;
  Display_on_Site__c?: boolean;
  Category__c?: string;
  Phone__c?: string;
  URL__c?: string;
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

export interface FormattedMealsPlusService extends Omit<
  MealsPlusArgs,
  "contactId"
> {
  url?: string;
  category?: string;
  phone?: string;
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
  Engagement_Type__c?: string;
  Community_Service_Type__c?: string;
}
