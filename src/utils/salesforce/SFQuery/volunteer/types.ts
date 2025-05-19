export interface Shift {
  Id: string;
  GW_Volunteers__Start_Date_Time__c: string;
  GW_Volunteers__Number_of_Volunteers_Still_Needed__c: number;
  Restaurant_Meals__c: boolean;
  GW_Volunteers__Duration__c: number;
  GW_Volunteers__Volunteer_Job__c: string;
  GW_Volunteers__Desired_Number_of_Volunteers__c: number;
  Car_Size_Required__c?: "Small" | "Medium" | "Large" | "Bike";
  Destination__c?: string;
}

export interface FormattedShift {
  id: string;
  startTime: string;
  open: boolean;
  job: string;
  restaurantMeals: boolean;
  duration: number;
  slots: number;
  totalSlots: number;
  carSizeRequired?: string;
}

export interface Job {
  Id: string;
  Name: string;
  GW_Volunteers__Inactive__c: boolean;
  GW_Volunteers__Ongoing__c: boolean;
  GW_Volunteers__Description__c: string;
  GW_Volunteers__Location_Street__c: string;
  Region__c?: "East Oakland" | "West Oakland";
  Fridge_Notes__c?: string;
  Destination__c?: string;
}

export interface FormattedJob {
  id: string;
  name: string;
  location: string;
  shifts: string[];
  active: boolean;
  ongoing: boolean;
  description: string;
  campaign: string;
  region?: "East Oakland" | "West Oakland";
  notes?: string;
  destination?: string;
  distance?: string;
}

export interface CreateHoursParams {
  contactId: string;
  shiftId: string;
  jobId: string;
  date: string;
  soup?: boolean;
  mealCount?: number;
  numberOfVolunteers?: number;
  restaurantMeals?: boolean;
}

export interface FormattedHours {
  id: string;
  mealCount: string;
  time: string;
  job: string;
  status: string;
  shift: string;
  campaign?: string;
  mealType?: "Entree" | "Soup";
}

export interface UnformattedHours {
  GW_Volunteers__Volunteer_Job__c: string;
  GW_Volunteers__Volunteer_Shift__c: string;
  GW_Volunteers__Status__c: string;
  GW_Volunteers__Start_Date__c: string;
  Id: string;
  Number_of_Meals__c?: number;
  GW_Volunteers__Shift_Start_Date_Time__c?: string;
  GW_Volunteers__Volunteer_Campaign__c: string;
  Type_of_Meal__c?: "Soup" | "Entree";
  GW_Volunteers__Contact__c?: string;
  GW_Volunteers__Number_of_Volunteers__c?: number;
  GW_Volunteers__Hours_Worked__c?: number;
  Restaurant_Meals__c?: boolean;
}

export interface HoursQueryResponse {
  data:
    | {
        records: UnformattedHours[];
      }
    | undefined;
}
