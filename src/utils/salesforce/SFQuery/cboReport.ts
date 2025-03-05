import fetcher from '../../fetcher';
import urls from '../../urls';
import {
  CBOReportParams,
  CBOReportObject,
} from '../../../mealProgram/routes/forms';
import { format } from 'date-fns';

export const getCBOReports = async (): Promise<CBOReportParams[]> => {
  await fetcher.setService('salesforce');

  const query = `SELECT Id FROM CBO_Report_Data__c`;

  const getUri = urls.SFQueryPrefix + encodeURIComponent(query);
  const { data }: { data: { records: { Id: string }[] } } = await fetcher.get(
    getUri
  );

  const promises = data.records.map(async ({ Id }) => {
    const { data: report }: { data: CBOReportObject } = await fetcher.get(
      `${urls.SFOperationPrefix}/CBO_Report_Data__c/${Id}`
    );
    return convertCBODataFromSalesforce(report);
  });
  const reports = await Promise.all(promises);
  return reports;
};

const convertCBODataFromSalesforce = (
  report: CBOReportObject
): CBOReportParams => {
  return {
    month: report.Month__c,
    year: format(new Date(report.Date__c), 'yyyy'),
    name: report.Name,
    cboId: report.CBO__c,
    CBOName: report.CBO_Name__c,
    performanceMeasures: {
      percentWOAccess: report.Percent_without__c,
      mealsProvided: report.Meals_Provided__c,
      unusable: report.Unusable_Meals__c,
      postcards: report.Calfresh_Postcards__c,
      calfreshApps: report.Assisted_with_Calfresh_Applications__c,
      SSA: report.Calfresh_Applications_Sent_to_SSA__c,
    },
    age: {
      age17: report.Age_0_17__c,
      age26: report.Age_18_26__c,
      age49: report.Age_27_49__c,
      age60: report.Age_50_60__c,
      ageOver60: report.Age_Over_60__c,
      ageUnknown: report.Age_Unknown__c,
    },
    race: {
      raceAfrican: report.Race_African__c,
      raceLatin: report.Race_Latin__c,
      raceAsian: report.Race_Asian__c,
      raceNativeAmerican: report.Race_Native_American__c,
      raceWhite: report.Race_White__c,
      raceDecline: report.Race_Decline_to_Answer__c,
      raceUnknown: report.Race_Unknown__c,
      raceOther: report.Race_Other__c,
      raceOtherText: report.Race_Other_Specify__c,
      raceMixed: report.Race_Mixed__c,
      raceMixedText: report.Race_Mixed_Specify__c,
    },
    individuals: report.Individuals_Provided_Food__c,
    households: report.Households_Provided_Food__c,
    feedback: report.Feedback__c,
    phoneNumber: report.Phone_Number__c,
    email: report.Email__c,
    zips: {
      94501: report.X94501__c,
      94502: report.X94502__c,
      94536: report.X94536__c,
      94537: report.X94537__c,
      94538: report.X94538__c,
      94539: report.X94539__c,
      94540: report.X94540__c,
      94541: report.X94541__c,
      94542: report.X94542__c,
      94543: report.X94543__c,
      94544: report.X94544__c,
      94545: report.X94545__c,
      94546: report.X94546__c,
      94550: report.X94550__c,
      94551: report.X94551__c,
      94552: report.X94552__c,
      94555: report.X94555__c,
      94557: report.X94557__c,
      94560: report.X94560__c,
      94566: report.X94566__c,
      94568: report.X94568__c,
      94577: report.X94577__c,
      94578: report.X94578__c,
      94579: report.X94579__c,
      94580: report.X94580__c,
      94586: report.X94586__c,
      94587: report.X94587__c,
      94588: report.X94588__c,
      94601: report.X94601__c,
      94602: report.X94602__c,
      94603: report.X94603__c,
      94604: report.X94604__c,
      94605: report.X94605__c,
      94606: report.X94606__c,
      94607: report.X94607__c,
      94608: report.X94607__c,
      94609: report.X94609__c,
      94610: report.X94610__c,
      94611: report.X94611__c,
      94612: report.X94612__c,
      94613: report.X94613__c,
      94614: report.X94614__c,
      94615: report.X94615__c,
      94616: report.X94616__c,
      94617: report.X94617__c,
      94618: report.X94618__c,
      94619: report.X94619__c,
      94620: report.X94620__c,
      94621: report.X94621__c,
      94623: report.X94623__c,
      94624: report.X94624__c,
      94661: report.X94661__c,
      94662: report.X94662__c,
      94701: report.X94701__c,
      94702: report.X94702__c,
      94703: report.X94703__c,
      94704: report.X94704__c,
      94705: report.X94705__c,
      94706: report.X94706__c,
      94707: report.X94707__c,
      94708: report.X94708__c,
      94709: report.X94709__c,
      94710: report.X94710__c,
      94712: report.X94712__c,
      DeclinetoState: report.XDeclinetoState__c,
      Unhoused: report.XUnhoused__c,
      Other: report.XOther__c,
    },
    waters: report.Water_Bottles_Distributed__c,
    juices: report.Juice_Boxes_Distributed__c,
    socks: report.Pairs_of_Socks_Distributed__c,

    extraItem: report.Extra_Item__c,
    extraItemAmount: report.Amount_of_Extra_Item__c,
  };
};

export const getPeriodCBOReports = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}): Promise<CBOReportParams[]> => {
  await fetcher.setService('salesforce');

  const query = `SELECT Id FROM CBO_Report_Data__c WHERE Date__c >= ${format(
    startDate,
    'yyyy-MM-dd'
  )} AND Date__c <= ${format(endDate, 'yyyy-MM-dd')}`;

  const getUri = urls.SFQueryPrefix + encodeURIComponent(query);
  const { data }: { data: { records: { Id: string }[] } } = await fetcher.get(
    getUri
  );

  const promises = data.records.map(async ({ Id }) => {
    const { data: report }: { data: CBOReportObject } = await fetcher.get(
      `${urls.SFOperationPrefix}/CBO_Report_Data__c/${Id}`
    );
    return convertCBODataFromSalesforce(report);
  });
  const reports = await Promise.all(promises);
  return reports;
};
