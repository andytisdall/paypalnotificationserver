import fetcher from "../../../fetcher";
import createQuery, { FilterGroup } from "../../queryCreator";
import { UnformattedHours, CheckInVolunteer } from "../types";

export const getVolunteersForCheckIn = async (
  shiftId: string,
): Promise<CheckInVolunteer[]> => {
  await fetcher.setService("salesforce");

  const fields = [
    "Id",
    "GW_Volunteers__Contact__c",
    "GW_Volunteers__Status__c",
  ] as const;
  const obj = "GW_Volunteers__Volunteer_Hours__c";
  const filters: FilterGroup<UnformattedHours> = {
    AND: [
      { field: "GW_Volunteers__Status__c", operator: "!=", value: "Canceled" },
      { field: "GW_Volunteers__Volunteer_Shift__c", value: shiftId },
    ],
  };

  const hours = await createQuery<UnformattedHours, (typeof fields)[number]>({
    fields,
    obj,
    filters,
    join: {
      GW_Volunteers__Contact__r: [
        "Id",
        "FirstName",
        "LastName",
        "Email",
        "CK_Kitchen_Agreement__c",
      ],
    },
  });

  return hours.map((hour) => {
    return {
      hoursId: hour.Id,
      contactId: hour.GW_Volunteers__Contact__r!.Id,
      firstName: hour.GW_Volunteers__Contact__r!.FirstName,
      lastName: hour.GW_Volunteers__Contact__r!.LastName,
      email: hour.GW_Volunteers__Contact__r!.Email,
      volunteerAgreement:
        hour.GW_Volunteers__Contact__r!.CK_Kitchen_Agreement__c,
      status: hour.GW_Volunteers__Status__c,
    };
  });
};
