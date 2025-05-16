export interface AccountAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface UnformattedD4JRestaurant {
  Name: string;
  Id: string;
  BillingAddress: AccountAddress;
  Google_ID__c: string;
  Minority_Owned__c?: string;
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
  D4J_Status__c?: "Active" | "Former" | "Paused";
  Closed__c?: boolean;
  Website?: string;
}

export type Coordinates = { latitude: number; longitude: number };

export interface FormattedD4JRestaurant {
  name: string;
  id: string;
  neighborhood?: string;
  cuisine?: string;
  pocOwned?: string;
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
  status?: "Active" | "Former" | "Paused";
  closed?: boolean;
  url?: string;
}
