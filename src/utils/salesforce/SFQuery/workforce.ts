import fetcher from "../../fetcher";
import urls from "../../urls";

interface ProgramEngagement {
  pmdm__Contact__c: string;
  pmdm__Stage__c: "Applied";
  pmdm__ProgramCohort__c: "a1uUP000005hD8nYAE";
  pmdm__Program__c: "a1yUP000001IH0DYAW";
  Has_Access_to_Internet__c: boolean;
  Bio__c: string;
  How_did_they_hear_about_this_program__c: string;
}

export const createProgramEngagement = async ({
  contactId,
  internet,
  source,
  bio,
}: {
  contactId: string;
  internet: boolean;
  source: string;
  bio: string;
}) => {
  await fetcher.setService("salesforce");

  const newEngagement: ProgramEngagement = {
    pmdm__Contact__c: contactId,
    pmdm__Stage__c: "Applied",
    pmdm__ProgramCohort__c: "a1uUP000005hD8nYAE",
    pmdm__Program__c: "a1yUP000001IH0DYAW",
    Has_Access_to_Internet__c: internet,
    Bio__c: bio,
    How_did_they_hear_about_this_program__c: source,
  };

  await fetcher.post(
    urls.SFOperationPrefix + "/pmdm__ProgramEngagement__c",
    newEngagement
  );
};
