import moment from "moment";

import urls from "../../../urls";
import fetcher from "../../../fetcher";
import { Shift } from "./types";

export const getShifts = async (jobId: string, daysInAdvance: number = 60) => {
  const queryEndDate = moment().add(daysInAdvance, "days").format();

  const query = `SELECT Id, GW_Volunteers__Start_Date_Time__c, GW_Volunteers__Number_of_Volunteers_Still_Needed__c, GW_Volunteers__Duration__c, GW_Volunteers__Desired_Number_of_Volunteers__c, Car_Size_Required__c from GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${jobId}' AND GW_Volunteers__Start_Date_time__c >= TODAY AND  GW_Volunteers__Start_Date_time__c <= ${queryEndDate}`;

  const shiftQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: {
    data: {
      records:
        | Pick<
            Shift,
            | "Id"
            | "GW_Volunteers__Start_Date_Time__c"
            | "GW_Volunteers__Number_of_Volunteers_Still_Needed__c"
            | "GW_Volunteers__Duration__c"
            | "Car_Size_Required__c"
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
      duration: js.GW_Volunteers__Duration__c,
      carSizeRequired: js.Car_Size_Required__c,
    };
  });
};
