export interface UnformattedContact {
  Name: string;
  FirstName?: string;
  LastName: string;
  Email?: string;
  HomePhone?: string;
  Id: string;
  npsp__HHId__c: string;
  MailingStreet?: string;

  // general volunteer

  Portal_Username__c?: string;
  Portal_Temporary_Password__c?: string;

  GW_Volunteers__Volunteer_Skills__c?: string;
  GW_Volunteers__Volunteer_Status__c?: string;
  GW_Volunteers__Volunteer_Notes__c?: string;
  Instagram_Handle__c?: string;
  How_did_they_hear_about_CK__c?: string;
  Interest_in_volunteering_group__c?: string;
  Subscribe_to_Bike_East_Bay_newsletter__c?: boolean;

  // home chef
  Home_Chef_Status__c?: string;
  Home_Chef_Volunteeer_Agreement__c?: boolean;
  Home_Chef_Food_Handler_Certification__c?: boolean;
  Home_Chef_Quiz_Passed__c?: boolean;
  Home_Chef_Survey_Completed__c?: boolean;

  //ck kitchen
  CK_Kitchen_Agreement__c?: boolean;
  CK_Kitchen_Volunteer_Status__c?: string;

  // driver
  Car_Size__c?: "Bike" | "Small" | "Medium" | "Large";
  Car_Make__c?: string;
  Car_Model__c?: string;
  Car_Year__c?: string;
  Car_Color__c?: string;
  Driver_s_License_Expiration__c?: string;
  Driver_Volunteer_Status__c?: "Active" | "Inactive";
  Insurance_Expiration_Date__c?: string;
}

export interface FormattedContact {
  householdId: string;
  name: string;
  id: string;
  email?: string;
  portalUsername?: string;
  firstName?: string;
  lastName: string;
  volunteerAgreement?: boolean;

  foodHandler?: boolean;
  homeChefAgreement?: boolean;
  homeChefStatus?: string;
  homeChefQuizPassed?: boolean;
  homeChefSurveyCompleted?: boolean;

  ckKitchenStatus?: string;

  driverStatus?: "Active" | "Inactive";
  car?: {
    size?: "Bike" | "Small" | "Medium" | "Large";
    make?: string;
    model?: string;
    year?: string;
    color?: string;
  };
  insuranceExpiration?: string;
  licenseExpiration?: string;
}

export interface D4JContact {
  firstName: string;
  email: string;
  id: string;
  d4jPoints?: number;
}

export type ContactRawData = Pick<
  UnformattedContact,
  | "Id"
  | "Name"
  | "npsp__HHId__c"
  | "Portal_Username__c"
  | "Email"
  | "FirstName"
  | "LastName"
  | "CK_Kitchen_Agreement__c"
>;

export type ContactData = Pick<
  FormattedContact,
  | "id"
  | "name"
  | "householdId"
  | "portalUsername"
  | "email"
  | "firstName"
  | "lastName"
  | "volunteerAgreement"
>;
