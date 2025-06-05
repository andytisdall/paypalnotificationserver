import { updateContact } from "../contact/contact";
import { UnformattedContact } from "../contact/types";

export const updateHomeChefStatus = async (
  contact: UnformattedContact,
  data: { agreement?: boolean; foodHandler?: boolean; quiz?: boolean }
) => {
  if (!contact.Home_Chef_Volunteeer_Agreement__c) {
    contact.Home_Chef_Volunteeer_Agreement__c = data.agreement;
  }
  if (!contact.Home_Chef_Food_Handler_Certification__c) {
    contact.Home_Chef_Food_Handler_Certification__c = data.foodHandler;
  }
  if (!contact.Home_Chef_Quiz_Passed__c) {
    contact.Home_Chef_Quiz_Passed__c = data.quiz;
  }

  if (
    contact.Home_Chef_Volunteeer_Agreement__c &&
    contact.Home_Chef_Food_Handler_Certification__c &&
    contact.Home_Chef_Quiz_Passed__c
  ) {
    contact.Home_Chef_Status__c = "Active";
  }

  await updateContact(contact.Id, {
    Home_Chef_Food_Handler_Certification__c:
      contact.Home_Chef_Food_Handler_Certification__c,
    Home_Chef_Volunteeer_Agreement__c:
      contact.Home_Chef_Volunteeer_Agreement__c,
    Home_Chef_Quiz_Passed__c: contact.Home_Chef_Quiz_Passed__c,
    Home_Chef_Status__c: contact.Home_Chef_Status__c,
  });
};
