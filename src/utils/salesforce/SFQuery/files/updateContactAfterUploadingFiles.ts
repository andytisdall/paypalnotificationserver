import fetcher from "../../../fetcher";
import { UnformattedContact } from "../contact";
import urls from "../../../urls";

export default async (
  fileTitles: string[],
  contact: UnformattedContact,
  homeChefQuizPass?: boolean
) => {
  await fetcher.setService("salesforce");

  const patchData: Partial<UnformattedContact> = {};

  // home chef
  if (fileTitles.includes("FH")) {
    patchData.Home_Chef_Food_Handler_Certification__c = true;
  }
  if (fileTitles.includes("HC")) {
    patchData.Home_Chef_Volunteeer_Agreement__c = true;
  }
  if (homeChefQuizPass) {
    patchData.Home_Chef_Quiz_Passed__c = true;
  }

  //  mark account as active if all required docs are present
  const foodHandlerPresent =
    contact.Home_Chef_Food_Handler_Certification__c ||
    patchData.Home_Chef_Food_Handler_Certification__c;
  const homeChefAgreementPresent =
    contact.Home_Chef_Volunteeer_Agreement__c ||
    patchData.Home_Chef_Volunteeer_Agreement__c;
  const homeChefQuizPasssed =
    homeChefQuizPass || contact.Home_Chef_Quiz_Passed__c;

  if (foodHandlerPresent && homeChefAgreementPresent && homeChefQuizPasssed) {
    patchData.Home_Chef_Status__c = "Active";
  }

  // ck kitchen
  if (fileTitles.includes("CKK")) {
    patchData.CK_Kitchen_Agreement__c = true;
    patchData.CK_Kitchen_Volunteer_Status__c = "Active";
  }

  const accountUpdateUri = urls.SFOperationPrefix + "/Contact/" + contact.Id;

  await fetcher.patch(accountUpdateUri, patchData);
};
