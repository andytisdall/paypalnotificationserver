export interface AccountAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface UnformattedRestaurant {
  Meal_Program_Onboarding__c: string;
  Meal_Program_Status__c: string;
  Health_Department_Expiration_Date__c: string;
  Name: string;
  Id: string;
  Billing_Address: AccountAddress;
}

export interface Restaurant {
  onboarding: string;
}

export interface UnformattedD4JRestaurant {
  Name: string;
  Id: string;
  BillingAddress: AccountAddress;
  Google_ID__c: string;
  Minority_Owned__c?: string;
  Restaurant_Underserved_Neighborhood__c: boolean;
  Restaurant_Vegan__c: boolean;
  Female_Owned__c: boolean;
  Type_of_Food__c?: string;
  Open_Hours__c?: string;
  Geolocation__c?: { latitude: number; longitude: number };
  Photo_URL__c?: string;
  Cocktail_Name__c?: string;
  Cocktail_Description__c?: string;
  Cocktail_2_Name__c?: string;
  Cocktail_2_Description__c?: string;
  D4J_Status__c?: 'Active' | 'Former' | 'Paused';
  Closed__c?: boolean;
}

export type Coordinates = { latitude: number; longitude: number };

export interface FormattedD4JRestaurant {
  name: string;
  id: string;
  neighborhood?: string;
  cuisine?: string;
  pocOwned?: string;
  underservedNeighborhood: boolean;
  vegan: boolean;
  femaleOwned: boolean;
  googleId: string;
  coords?: Coordinates;
  openHours?: string[];
  photo?: string;
  cocktailName?: string;
  cocktailDescription?: string;
  cocktail2Name?: string;
  cocktail2Description?: string;
  status?: 'Active' | 'Former' | 'Paused';
  closed?: boolean;
}
