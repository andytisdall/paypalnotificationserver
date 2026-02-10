import {
  SurveyArgs,
  Times,
  Days,
  Items,
} from "../../../../homeChef/routes/survey";
import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { updateContact } from "../contact/contact";
import { UnformattedContact } from "../contact/types";
import { HomeChefSurvey, HomeChefSurveyOptionLink } from "./types";

export const updateHomeChefStatus = async (
  contact: UnformattedContact,
  data: { agreement?: boolean; foodHandler?: boolean; quiz?: boolean },
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

const homeChefSurveyOptionIds = {
  "Grains (rice, pasta)": "a27UP000006Pf9NYAS",
  "Legumes (beans, lentils)": "a27UP000006PeonYAC",
  "Animal protein (chicken, beef)": "a27UP000006PfAzYAK",
  "Non-animal protein (tofu, seitan)": "a27UP000006PfEDYA0",
  Cheese: "a27UP000006PfFpYAK",
  Eggs: "a27UP000006PfHRYA0",
  otherItem: "a27UP000006RdZHYA0",

  sun9: "a27UP000006PeZtYAK",
  sun2: "a27UP000006Ped7YAC",
  sun4: "a27UP000006PeejYAC",

  mon9: "a27UP000006PegLYAS",
  mon2: "a27UP000006PehxYAC",
  mon4: "a27UP000006PejZYAS",

  tues9: "a27UP000006PelBYAS",
  tues2: "a27UP000006PetFYAS",
  tues4: "a27UP000006PewTYAS",

  wed9: "a27UP000006PbHyYAK",
  wed2: "a27UP000006Pf2vYAC",
  wed4: "a27UP000006PcEQYA0",

  thurs9: "a27UP000006Pf4XYAS",
  thurs2: "a27UP000006Pf69YAC",
  thurs4: "a27UP000006Pf7lYAC",

  otherTime: "a27UP000006Re2jYAC",

  moreItems: "a27UP000006ResLYAS",
  moreDates: "a27UP000006Rep7YAC",
};

export const createHomeChefSurvey = async ({
  times,
  more,
  contactId,
  items,
  otherItem,
  otherTime,
}: SurveyArgs & { contactId: string }) => {
  await fetcher.setService("salesforce");

  const newSurvey: Partial<HomeChefSurvey> = {
    Contact__c: contactId,
  };

  const url = urls.SFOperationPrefix + "/Home_Chef_Survey__c";

  const { data } = await fetcher.post(url, newSurvey);

  const surveyId = data.id;

  const dayPromises = (Object.keys(times) as [keyof Days]).map(async (day) => {
    const timePromises = (Object.keys(times[day]) as [keyof Times]).map(
      async (time) => {
        if (times[day][time]) {
          const optionId =
            homeChefSurveyOptionIds[
              (day + time) as keyof typeof homeChefSurveyOptionIds
            ];

          const timeUrl =
            urls.SFOperationPrefix + "/Home_Chef_Survey_Option_Link__c";
          const newTimeOptionLink: Partial<HomeChefSurveyOptionLink> = {
            Home_Chef_Survey__c: surveyId,
            Home_Chef_Survey_Option__c: optionId,
          };
          fetcher.post(timeUrl, newTimeOptionLink);
        }
      },
    );

    Promise.all(timePromises);
  });
  if (otherTime) {
    const optionId = homeChefSurveyOptionIds.otherTime;
    const timeUrl = urls.SFOperationPrefix + "/Home_Chef_Survey_Option_Link__c";
    const newTimeOptionLink: Partial<HomeChefSurveyOptionLink> = {
      Home_Chef_Survey__c: surveyId,
      Home_Chef_Survey_Option__c: optionId,
      Details__c: otherTime,
    };
    await fetcher.post(timeUrl, newTimeOptionLink);
  }

  const itemPromises = (Object.keys(items) as [keyof Items]).map(
    async (item) => {
      if (items[item]) {
        const optionId =
          homeChefSurveyOptionIds[item as keyof typeof homeChefSurveyOptionIds];

        const itemUrl =
          urls.SFOperationPrefix + "/Home_Chef_Survey_Option_Link__c";
        const newTimeOptionLink: Partial<HomeChefSurveyOptionLink> = {
          Home_Chef_Survey__c: surveyId,
          Home_Chef_Survey_Option__c: optionId,
        };
        fetcher.post(itemUrl, newTimeOptionLink);
      }
    },
  );
  if (otherItem) {
    const optionId = homeChefSurveyOptionIds.otherItem;
    const timeUrl = urls.SFOperationPrefix + "/Home_Chef_Survey_Option_Link__c";
    const newTimeOptionLink: Partial<HomeChefSurveyOptionLink> = {
      Home_Chef_Survey__c: surveyId,
      Home_Chef_Survey_Option__c: optionId,
      Details__c: otherItem,
    };
    await fetcher.post(timeUrl, newTimeOptionLink);
  }

  if (more === "dates") {
    const optionId = homeChefSurveyOptionIds.moreDates;
    const timeUrl = urls.SFOperationPrefix + "/Home_Chef_Survey_Option_Link__c";
    const newTimeOptionLink: Partial<HomeChefSurveyOptionLink> = {
      Home_Chef_Survey__c: surveyId,
      Home_Chef_Survey_Option__c: optionId,
    };
    await fetcher.post(timeUrl, newTimeOptionLink);
  }
  if (more === "items") {
    const optionId = homeChefSurveyOptionIds.moreItems;
    const timeUrl = urls.SFOperationPrefix + "/Home_Chef_Survey_Option_Link__c";
    const newTimeOptionLink: Partial<HomeChefSurveyOptionLink> = {
      Home_Chef_Survey__c: surveyId,
      Home_Chef_Survey_Option__c: optionId,
    };
    await fetcher.post(timeUrl, newTimeOptionLink);
  }

  // update contact

  await updateContact(contactId, { Home_Chef_Survey_Completed__c: true });

  await Promise.all([...dayPromises, ...itemPromises]);
};
