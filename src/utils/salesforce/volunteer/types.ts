import {
  LowercaseRegion,
  VolunteerShift,
} from "@community-kitchens/apiinterfaces";
import { UnformattedContact } from "../contact/types";

// type TownFridgeRegion =
//   | "East Oakland"
//   | "West Oakland"
//   | "Berkeley"
//   | "CK Kitchen"
//   | "Alameda";

export interface UnformattedShift {
  Id: string;
  GW_Volunteers__Start_Date_Time__c: string;
  GW_Volunteers__Number_of_Volunteers_Still_Needed__c: number;
  Restaurant_Meals__c: boolean;
  GW_Volunteers__Duration__c: number;
  GW_Volunteers__Volunteer_Job__c: string;
  GW_Volunteers__Desired_Number_of_Volunteers__c: number;
  GW_Volunteers__Job_Location_Street__c?: string;
  GW_Volunteers__Job_Location_City__c?: string;
  End_Time__c?: string;
  GW_Volunteers__Volunteer_Job__r: UnformattedJob | string;
  "GW_Volunteers__Volunteer_Job__r.GW_Volunteers__Campaign__c": string;
  Reserved_Shift_is_Available__c?: boolean;
}

// export interface FormattedShift {
//   id: string;
//   startTime: string;
//   open: boolean;
//   job: string;
//   restaurantMeals: boolean;
//   duration: number;
//   slots: number;
//   totalSlots: number;
//   endTime?: string;
//   reservedOpen?: boolean;
// }

export interface UnformattedJob {
  Id: string;
  Name: string;
  GW_Volunteers__Inactive__c: boolean;
  GW_Volunteers__Ongoing__c: boolean;
  GW_Volunteers__Description__c: string;
  GW_Volunteers__Location_Street__c: string;
  GW_Volunteers__Location_City__c: string;
  GW_Volunteers__Location_Information__c: string;
  Region__c?: LowercaseRegion;
  Fridge_Notes__c?: string;
  Car_Size_Required__c?: "Small" | "Medium" | "Large" | "Bike";
  Dropoff_Location__c?: string;
  Dropoff_Notes__c?: string;
  GW_Volunteers__Campaign__c: string;
  GW_Volunteers__Display_on_Website__c: string;
  Distance__c?: number;
  Time_Required__c?: number;
  No_Text_Alert__c?: boolean;
  Photo__c?: string;
}

// export interface FormattedJob {
//   id: string;
//   name: string;
//   location?: string;
//   locationInfo?: string;
//   locationCity?: string;
//   shifts: Partial<VolunteerShift>[];
//   active: boolean;
//   ongoing: boolean;
//   description?: string;
//   campaign: string;
//   region?: LowercaseRegion;
//   notes?: string;
//   carSizeRequired?: string;
//   destination?: string;
//   distance?: number;
//   dropoffNotes?: string;
//   timeRequired?: number;
//   noTextAlert?: boolean;
//   photo?: string;
// }

export interface CreateHoursParams {
  contactId: string;
  shiftId: string;
  jobId: string;
  date: string;
  soup?: boolean;
  mealCount?: number;
  numberOfVolunteers?: number;
  restaurantMeals?: boolean;
  serviceType?: string;
  reserved?: boolean;
}

// export interface FormattedHours {
//   id: string;
//   mealCount: string;
//   time: string;
//   job: string;
//   status: string;
//   shift: string;
//   campaign?: string;
//   mealType?: "Entree" | "Soup";
// }

export interface UnformattedHours {
  GW_Volunteers__Volunteer_Job__c: string;
  GW_Volunteers__Volunteer_Shift__c: string;
  GW_Volunteers__Status__c: string;
  GW_Volunteers__Start_Date__c: string;
  Id: string;
  Number_of_Meals__c?: number;
  GW_Volunteers__Shift_Start_Date_Time__c: string;
  GW_Volunteers__Volunteer_Campaign__c: string;
  Type_of_Meal__c?: "Soup" | "Entree";
  GW_Volunteers__Contact__c: string;
  GW_Volunteers__Number_of_Volunteers__c?: number;
  GW_Volunteers__Hours_Worked__c?: number;
  Restaurant_Meals__c?: boolean;
  GW_Volunteers__Volunteer_Campaign_Name__c: string;
  GW_Volunteers__Start_Date_Time__c: string;
  Text_Reminder_Status__c?: "Sent" | "Responded";
  "GW_Volunteers__Contact__r.Id": string;
  "GW_Volunteers__Contact__r.FirstName": string;
  "GW_Volunteers__Contact__r.LastName": string;
  "GW_Volunteers__Contact__r.Email": string;
  "GW_Volunteers__Contact__r.CK_Kitchen_Agreement__c": boolean;
  GW_Volunteers__Contact__r: UnformattedContact;
  Reserved_for_Calfresh__c: boolean;
}

export interface HoursQueryResponse {
  data:
    | {
        records: UnformattedHours[];
      }
    | undefined;
}

// export interface CheckInVolunteer {
//   hoursId: string;
//   contactId: string;
//   firstName: string | undefined;
//   lastName: string;
//   email: string | undefined;
//   volunteerAgreement: boolean | undefined;
//   status: string;
// }
