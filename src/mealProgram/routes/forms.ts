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

  res.sendStatus(204);
});

export type ZipCode =
  | '94501'
  | '94502'
  | '94536'
  | '94537'
  | '94538'
  | '94539'
  | '94540'
  | '94541'
  | '94542'
  | '94543'
  | '94544'
  | '94545'
  | '94546'
  | '94550'
  | '94551'
  | '94552'
  | '94555'
  | '94557'
  | '94560'
  | '94566'
  | '94568'
  | '94577'
  | '94578'
  | '94579'
  | '94580'
  | '94586'
  | '94587'
  | '94588'
  | '94601'
  | '94602'
  | '94603'
  | '94604'
  | '94605'
  | '94606'
  | '94607'
  | '94608'
  | '94609'
  | '94610'
  | '94611'
  | '94612'
  | '94613'
  | '94614'
  | '94615'
  | '94616'
  | '94617'
  | '94618'
  | '94619'
  | '94620'
  | '94621'
  | '94623'
  | '94624'
  | '94661'
  | '94662'
  | '94701'
  | '94702'
  | '94703'
  | '94704'
  | '94705'
  | '94706'
  | '94707'
  | '94708'
  | '94709'
  | '94710'
  | '94712'
  | 'DeclinetoState'
  | 'Unhoused'
  | 'Other';

export interface CBOReportParams {
  month: string;
  year: string;
  name: string;
  CBOName: string;
  performanceMeasures: {
    percentWOAccess: number;
    mealsProvided: number;
    unusable: number;
    postcards: number;
    calfreshApps: number;
    SSA: number;
  };
  age: {
    age17: number;
    age26: number;
    age49: number;
    age60: number;
    ageOver60: number;
    ageUnknown: number;
  };
  race: {
    raceAfrican: number;
    raceLatin: number;
    raceAsian: number;
    raceNativeAmerican: number;
    raceWhite: number;
    raceDecline: number;
    raceUnknown: number;
    raceOther: number;
    raceOtherText: number;
    raceMixed: number;
    raceMixedText: number;
  };
  individuals: number;
  households: number;
  zips: Record<ZipCode, number | undefined>;
  feedback: string;
  phoneNumber: string;
  email: string;
  waters?: number;
  juices?: number;
  socks?: number;
  extraItem?: string;
  extraItemAmount?: number;
  tortillaChips?: number;
  granolaBars?: number;
  cboId: string;
}

export interface CBOReportObject {
  Age_0_17__c: number;
  Age_18_26__c: number;
  Age_27_49__c: number;
  Age_50_60__c: number;
  Age_Over_60__c: number;
  Age_Unknown__c: number;
  Assisted_with_Calfresh_Applications__c: number;
  Calfresh_Applications_Sent_to_SSA__c: number;
  Calfresh_Postcards__c: number;
  CBO_Name__c: string;
  Feedback__c: string;
  Individuals_Provided_Food__c: number;
  Households_Provided_Food__c: number;
  Meals_Provided__c: number;
  Month__c: string;
  Contact_Name__c: string;
  Name: string;
  Percent_without__c: number;
  Race_African__c: number;
  Race_Asian__c: number;
  Race_Decline_to_Answer__c: number;
  Race_Latin__c: number;
  Race_Mixed__c: number;
  Race_Mixed_Specify__c: number;
  Race_Native_American__c: number;
  Race_Other__c: number;
  Race_Other_Specify__c: number;
  Race_White__c: number;
  Race_Unknown__c: number;
  Unusable_Meals__c: number;
  Phone_Number__c: string;
  Email__c: string;
  Date__c: string;
  X94501__c?: number;
  X94502__c?: number;
  X94536__c?: number;
  X94537__c?: number;
  X94538__c?: number;
  X94539__c?: number;
  X94540__c?: number;
  X94541__c?: number;
  X94542__c?: number;
  X94543__c?: number;
  X94544__c?: number;
  X94545__c?: number;
  X94546__c?: number;
  X94550__c?: number;
  X94551__c?: number;
  X94552__c?: number;
  X94555__c?: number;
  X94557__c?: number;
  X94560__c?: number;
  X94566__c?: number;
  X94568__c?: number;
  X94577__c?: number;
  X94578__c?: number;
  X94579__c?: number;
  X94580__c?: number;
  X94586__c?: number;
  X94587__c?: number;
  X94588__c?: number;
  X94601__c?: number;
  X94602__c?: number;
  X94603__c?: number;
  X94604__c?: number;
  X94605__c?: number;
  X94606__c?: number;
  X94607__c?: number;
  X94608__c?: number;
  X94609__c?: number;
  X94610__c?: number;
  X94611__c?: number;
  X94612__c?: number;
  X94613__c?: number;
  X94614__c?: number;
  X94615__c?: number;
  X94616__c?: number;
  X94617__c?: number;
  X94618__c?: number;
  X94619__c?: number;
  X94620__c?: number;
  X94621__c?: number;
  X94623__c?: number;
  X94624__c?: number;
  X94661__c?: number;
  X94662__c?: number;
  X94701__c?: number;
  X94702__c?: number;
  X94703__c?: number;
  X94704__c?: number;
  X94705__c?: number;
  X94706__c?: number;
  X94707__c?: number;
  X94708__c?: number;
  X94709__c?: number;
  X94710__c?: number;
  X94712__c?: number;
  XDeclinetoState__c?: number;
  XUnhoused__c?: number;
  XOther__c?: number;
  CBO_Report_Summary__c: string;
  Water_Bottles_Distributed__c?: number;
  Juice_Boxes_Distributed__c?: number;
  Pairs_of_Socks_Distributed__c?: number;
  Amount_of_Extra_Item__c?: number;
  Extra_Item__c?: string;
  Granola_Bars_Distributed__c?: number;
  Tortilla_Chip_Bags_Distributed__c?: number;
  CBO__c: string;
}

router.post('/cbo-report', async (req, res) => {
  const {
    month,
    name,
    CBOName,
    performanceMeasures,
    age,
    race,
    individuals,
    households,
    zips,
    feedback,
    phoneNumber,
    email,
    year,
    waters,
    juices,
    socks,
    extraItem,
    extraItemAmount,
    granolaBars,
    tortillaChips,
  }: CBOReportParams = req.body;

  const date = new Date();
  date.setMonth(parseInt(month));
  date.setFullYear(parseInt(year));
  const lastDay = lastDayOfMonth(date);

  const CBOReportObject: Partial<CBOReportObject> = {
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
    Individuals_Provided_Food__c: individuals,
    Households_Provided_Food__c: households,
    Meals_Provided__c: performanceMeasures.mealsProvided,
    Month__c: format(lastDay, 'LLLL'),
    Contact_Name__c: name,
    Name: `${CBOName} - ${format(lastDay, 'LLLL')} ${year}`,
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
    Race_Unknown__c: race.raceUnknown,
    Unusable_Meals__c: performanceMeasures.unusable,
    Phone_Number__c: phoneNumber,
    Email__c: email,
    Date__c: formatISO(lastDay),
    X94501__c: zips[94501],
    X94502__c: zips[94502],
    X94536__c: zips[94536],
    X94537__c: zips[94537],
    X94538__c: zips[94538],
    X94539__c: zips[94539],
    X94540__c: zips[94540],
    X94541__c: zips[94541],
    X94542__c: zips[94542],
    X94543__c: zips[94543],
    X94544__c: zips[94544],
    X94545__c: zips[94545],
    X94546__c: zips[94546],
    X94550__c: zips[94550],
    X94551__c: zips[94551],
    X94552__c: zips[94552],
    X94555__c: zips[94555],
    X94557__c: zips[94557],
    X94560__c: zips[94560],
    X94566__c: zips[94566],
    X94568__c: zips[94568],
    X94577__c: zips[94577],
    X94578__c: zips[94578],
    X94579__c: zips[94579],
    X94580__c: zips[94580],
    X94586__c: zips[94586],
    X94587__c: zips[94587],
    X94588__c: zips[94588],
    X94601__c: zips[94601],
    X94602__c: zips[94602],
    X94603__c: zips[94603],
    X94604__c: zips[94604],
    X94605__c: zips[94605],
    X94606__c: zips[94606],
    X94607__c: zips[94607],
    X94608__c: zips[94608],
    X94609__c: zips[94609],
    X94610__c: zips[94610],
    X94611__c: zips[94611],
    X94612__c: zips[94612],
    X94613__c: zips[94613],
    X94614__c: zips[94614],
    X94615__c: zips[94615],
    X94616__c: zips[94616],
    X94617__c: zips[94617],
    X94618__c: zips[94618],
    X94619__c: zips[94619],
    X94621__c: zips[94621],
    X94623__c: zips[94623],
    X94624__c: zips[94624],
    X94661__c: zips[94661],
    X94662__c: zips[94662],
    X94701__c: zips[94701],
    X94702__c: zips[94702],
    X94703__c: zips[94703],
    X94704__c: zips[94704],
    X94705__c: zips[94705],
    X94706__c: zips[94706],
    X94707__c: zips[94707],
    X94708__c: zips[94708],
    X94709__c: zips[94709],
    X94710__c: zips[94710],
    X94712__c: zips[94712],
    Water_Bottles_Distributed__c: waters,
    Juice_Boxes_Distributed__c: juices,
    Pairs_of_Socks_Distributed__c: socks,
    Extra_Item__c: extraItem,
    Amount_of_Extra_Item__c: extraItemAmount,
    Granola_Bars_Distributed__c: granolaBars,
    Tortilla_Chip_Bags_Distributed__c: tortillaChips,
  };

  await fetcher.setService('salesforce');

  let summaryId = '';

  // check if summary object exist (each report is required to have a parent summary)

  const summaryQuery = `SELECT Id from CBO_Report_Summary__c WHERE Date__c = ${format(
    lastDay,
    'yyyy-MM-dd'
  )}`;

  const getSummaryUri = urls.SFQueryPrefix + encodeURIComponent(summaryQuery);

  const summaryQueryResult: { data: { records?: { Id: string }[] } } =
    await fetcher.get(getSummaryUri);

  if (!summaryQueryResult.data.records) {
    throw Error('Failed to get CBO summary object');
  }

  // create summary if it doesn't exist

  if (!summaryQueryResult.data.records.length) {
    const createSummaryUri = urls.SFOperationPrefix + '/CBO_Report_Summary__c';

    const newSummary = {
      Date__c: formatISO(lastDay),
      Name: `${format(lastDay, 'LLLL')} ${year}`,
    };

    const insertSummaryResult: { data: { success: boolean; id: string } } =
      await fetcher.post(createSummaryUri, newSummary);

    if (!insertSummaryResult.data.success) {
      throw Error('Could not create parent summary object');
    }

    summaryId = insertSummaryResult.data.id;
  } else {
    summaryId = summaryQueryResult.data.records[0].Id;
  }

  CBOReportObject.CBO_Report_Summary__c = summaryId;

  const insertUri = urls.SFOperationPrefix + '/CBO_Report_Data__c';

  const { data }: { data?: { success: boolean } } = await fetcher.post(
    insertUri,
    CBOReportObject
  );
  if (!data?.success) {
    throw Error('Unable to add data');
  }

  res.sendStatus(204);
});

export default router;
