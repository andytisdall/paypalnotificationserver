import moment from "moment";

import fetcher from "../../../fetcher";
import urls from "../../../urls";

export interface Shift {
  Id: string;
  GW_Volunteers__Start_Date_Time__c: string;
  GW_Volunteers__Number_of_Volunteers_Still_Needed__c: number;
  Restaurant_Meals__c: boolean;
  GW_Volunteers__Duration__c: number;
  GW_Volunteers__Volunteer_Job__c: string;
  GW_Volunteers__Desired_Number_of_Volunteers__c: number;
  Car_Size_Required__c?: "Small" | "Medium" | "Large" | "Bike";
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
}

export const getShift = async (
  shiftId: string
): Promise<FormattedShift | undefined> => {
  await fetcher.setService("salesforce");

  const url =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c/" + shiftId;

  const { data }: { data?: Shift } = await fetcher.get(url);

  if (data) {
    return {
      id: data.Id,
      startTime: data.GW_Volunteers__Start_Date_Time__c,
      open:
        data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === null ||
        data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0,
      slots: data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c,
      job: data.GW_Volunteers__Volunteer_Job__c,
      restaurantMeals: data.Restaurant_Meals__c,
      duration: data.GW_Volunteers__Duration__c,
      totalSlots: data.GW_Volunteers__Desired_Number_of_Volunteers__c,
    };
  }
};

export const getShifts = async (
  jobId: string,
  daysInAdvance: number = 60
): Promise<FormattedShift[]> => {
  const sixtyDaysFromNow = moment().add(daysInAdvance, "days").format();

  const query = `SELECT Id, GW_Volunteers__Start_Date_Time__c, GW_Volunteers__Number_of_Volunteers_Still_Needed__c, Restaurant_Meals__c, GW_Volunteers__Duration__c, GW_Volunteers__Desired_Number_of_Volunteers__c from GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${jobId}' AND GW_Volunteers__Start_Date_time__c >= TODAY AND  GW_Volunteers__Start_Date_time__c <= ${sixtyDaysFromNow}`;

  const shiftQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: {
    data: {
      records:
        | Pick<
            Shift,
            | "Id"
            | "GW_Volunteers__Start_Date_Time__c"
            | "GW_Volunteers__Number_of_Volunteers_Still_Needed__c"
            | "Restaurant_Meals__c"
            | "GW_Volunteers__Duration__c"
            // | "Car_Size_Required__c"
            | "GW_Volunteers__Desired_Number_of_Volunteers__c"
          >[]
        | undefined;
    };
  } = await fetcher.instance.get(shiftQueryUri);
  if (!res.data.records) {
    throw Error("Failed querying volunteer shifts");
  }
  return res.data.records.map((js) => {
    return {
      id: js.Id,
      startTime: js.GW_Volunteers__Start_Date_Time__c,
      open:
        js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === null ||
        js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0,
      slots: js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c,
      job: jobId,
      restaurantMeals: js.Restaurant_Meals__c,
      duration: js.GW_Volunteers__Duration__c,
      totalSlots: js.GW_Volunteers__Desired_Number_of_Volunteers__c,
      // carSizeRequired: js.Car_Size_Required__c,
    };
  });
};

export const addSlotToShift = async (shift: FormattedShift) => {
  await fetcher.setService("salesforce");
  const url =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c/" + shift.id;

  await fetcher.patch(url, {
    GW_Volunteers__Desired_Number_of_Volunteers__c: shift.totalSlots + 1,
  });
};

export const createShift = async (jobId: string) => {
  await fetcher.setService("salesforce");
  const url = urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c";

  const newShift: Partial<Shift> = {
    GW_Volunteers__Volunteer_Job__c: jobId,
    Restaurant_Meals__c: true,
    GW_Volunteers__Duration__c: 1,
    GW_Volunteers__Start_Date_Time__c: new Date().toISOString(),
  };
  const { data } = await fetcher.post(url, newShift);

  return data.id;
};
