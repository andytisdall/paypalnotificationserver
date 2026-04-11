import fetcher from "../../../fetcher";
import { UnformattedContact } from "../../contact/types";
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
  });

  const idList: string[] = hours.map(
    ({ GW_Volunteers__Contact__c }) => GW_Volunteers__Contact__c,
  );

  const contactFields = [
    "Id",
    "FirstName",
    "LastName",
    "Email",
    "CK_Kitchen_Agreement__c",
  ] as const;
  const contactObj = "Contact";
  const contactFilters: FilterGroup<UnformattedContact> = {
    AND: [{ field: "Id", operator: "IN", value: idList }],
  };

  const contacts = await createQuery<
    UnformattedContact,
    (typeof contactFields)[number]
  >({
    fields: contactFields,
    obj: contactObj,
    filters: contactFilters,
  });

  return hours
    .map(({ GW_Volunteers__Contact__c, GW_Volunteers__Status__c, Id }) => {
      const contact = contacts.find(
        ({ Id }) => Id === GW_Volunteers__Contact__c,
      );
      if (contact) {
        return {
          hoursId: Id,
          contactId: contact.Id,
          firstName: contact.FirstName,
          lastName: contact.LastName,
          email: contact.Email,
          volunteerAgreement: contact.CK_Kitchen_Agreement__c,
          status: GW_Volunteers__Status__c,
        };
      }
    })
    .filter((h) => h) as CheckInVolunteer[];
};
