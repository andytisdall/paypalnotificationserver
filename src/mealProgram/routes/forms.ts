import express from 'express';
import { formatISO, lastDayOfMonth, format } from 'date-fns';

import fetcher from '../../utils/fetcher';
import urls from '../../utils/urls';

const router = express.Router();

interface MealProgramIntakeForm {
  name: string;
  address: string;
  contactName: string;
  contactPosition: string;
  contactEmail: string;
  contactNumber: string;
  date: string;
  bipoc: boolean;
  female: boolean;
  neighborhood: string;
  hardship: boolean;
  ebt: boolean;
  deliver: boolean;
  source: string;
  food: string;
}

interface NewIntakeFormObject {
  Restaurant_Name__c: string;
  Restaurant_Address__c: string;
  Contact_Name__c: string;
  Contact_Email__c: string;
  Contact_Number__c: string;
  Contact_Position__c: string;
  Date__c: string;
  BIPOC_Owned__c: boolean;
  Female_Owned__c: boolean;
  Neighborhood__c: string;
  Financial_Hardship__c: boolean;
  EBT_Calfresh_Interest__c: boolean;
  Able_to_Deliver__c: boolean;
  How_Did_You_Hear_About_CK__c: string;
  Type_of_Food__c: string;
}

router.post('/intake-survey', async (req, res) => {
  const {
    name,
    address,
    contactName,
    contactEmail,
    contactNumber,
    contactPosition,
    date,
    bipoc,
    female,
    neighborhood,
    hardship,
    ebt,
    deliver,
    source,
    food,
  }: MealProgramIntakeForm = req.body;

  const insertUri = urls.SFOperationPrefix + '/Meal_Program_Intake_Form__c';

  const newIntakeForm: NewIntakeFormObject = {
    Restaurant_Name__c: name,
    Restaurant_Address__c: address,
    Contact_Name__c: contactName,
    Contact_Email__c: contactEmail,
    Contact_Number__c: contactNumber,
    Contact_Position__c: contactPosition,
    Date__c: date,
    BIPOC_Owned__c: bipoc,
    Female_Owned__c: female,
    Neighborhood__c: neighborhood,
    Financial_Hardship__c: hardship,
    EBT_Calfresh_Interest__c: ebt,
    Able_to_Deliver__c: deliver,
    How_Did_You_Hear_About_CK__c: source,
    Type_of_Food__c: food,
  };
  await fetcher.setService('salesforce');
  const { data }: { data?: { success: boolean } } = await fetcher.post(
    insertUri,
    newIntakeForm
  );

  if (!data?.success) {
    throw Error('Failed to save form data');
  }

  res.sendStatus(201);
});

interface CBOReportParams {
  month: string;
  year: string;
  name: string;
  CBOName: string;
  performanceMeasures: {
    percentWOAccess: string;
    mealsProvided: string;
    unusable: string;
    postcards: string;
    calfreshApps: string;
    SSA: string;
  };
  age: {
    age17: string;
    age26: string;
    age49: string;
    age60: string;
    ageOver60: string;
    ageUnknown: string;
  };
  race: {
    raceAfrican: string;
    raceLatin: string;
    raceAsian: string;
    raceNativeAmerican: string;
    raceWhite: string;
    raceDecline: string;
    raceUnknown: string;
    raceOther: string;
    raceOtherText: string;
    raceMixed: string;
    raceMixedText: string;
  };
  households: string;
  zips: Record<string, string>;
  feedback: string;
  phoneNumber: string;
  email: string;
}

router.post('/cbo-report', async (req, res) => {
  const {
    month,
    name,
    CBOName,
    performanceMeasures,
    age,
    race,
    households,
    zips,
    feedback,
    phoneNumber,
    email,
    year,
  }: CBOReportParams = req.body;

  const date = new Date();
  date.setMonth(parseInt(month));
  date.setFullYear(parseInt(year));
  const lastDay = lastDayOfMonth(date);

  const CBOReportObject: Record<string, string | number | undefined> = {
    Age_0_17__c: age.age17,
    Age_18_26__c: age.age26,
    Age_27_49__c: age.age49,
    Age_50_60__c: age.age60,
    Age_Over_60__c: age.ageOver60,
    Age_Unknown__c: age.ageUnknown,
    Assisted_with_Calfresh_Applications__c: performanceMeasures.calfreshApps,
    Calfresh_Applications_Sent_to_SSA__c: performanceMeasures.SSA,
    Calfresh_Postcards__c: performanceMeasures.postcards,
    CBO_Name__c: CBOName,
    Feedback__c: feedback,
    Households_Provided_Food__c: households,
    Meals_Provided__c: performanceMeasures.mealsProvided,
    Month__c: format(parseInt(month), 'LLLL'),
    Contact_Name__c: name,
    Name: `${CBOName} - ${format(parseInt(month), 'LLLL')} ${year}`,
    Percent_without__c: performanceMeasures.percentWOAccess,
    Race_African__c: race.raceAfrican,
    Race_Asian__c: race.raceAsian,
    Race_Decline_to_Answer__c: race.raceDecline,
    Race_Latin__c: race.raceLatin,
    Race_Mixed__c: race.raceMixed,
    Race_Mixed_Specify__c: race.raceMixedText,
    Race_Native_American__c: race.raceNativeAmerican,
    Race_Other__c: race.raceOther,
    Race_Other_Specify__c: race.raceOtherText,
    Race_White__c: race.raceWhite,
    Unusable_Meals__c: performanceMeasures.unusable,
    Phone_Number__c: phoneNumber,
    Email__c: email,
    Date__c: formatISO(lastDay),
  };

  for (let zip in zips) {
    CBOReportObject[`X${zip}__c`] = zips[zip];
  }

  await fetcher.setService('salesforce');

  const insertUri = urls.SFOperationPrefix + '/CBO_Report_Data__c';

  const { data }: { data?: { success: boolean } } = await fetcher.post(
    insertUri,
    CBOReportObject
  );
  if (!data?.success) {
    throw Error('Unable to add data');
  }

  res.sendStatus(201);
});

export default router;
