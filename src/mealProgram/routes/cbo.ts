import express from "express";
import { formatISO, lastDayOfMonth, format } from "date-fns";

import {
  CBOReportParams,
  CBOReportObject,
} from "../../utils/salesforce/SFQuery/cboReport";
import { getCBOReports } from "../../utils/salesforce/SFQuery/cboReport";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";
import { sendCBOReportDataEmail } from "../../utils/email/emailTemplates/CBOReportData";
import fetcher from "../../utils/fetcher";
import urls from "../../utils/urls";
import { requireSalesforceAuth } from "../../middlewares/require-salesforce-auth";

const router = express.Router();

router.get(
  "/cbo/reports",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const reports = await getCBOReports();
    res.send(reports);
  },
);

router.post("/cbo/email", requireSalesforceAuth, async (req, res) => {
  await sendCBOReportDataEmail();
  res.send({ success: true });
});

router.post("/cbo", async (req, res) => {
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
    Month__c: format(lastDay, "LLLL"),
    Contact_Name__c: name,
    Name: `${CBOName} - ${format(lastDay, "LLLL")} ${year}`,
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

  await fetcher.setService("salesforce");

  let summaryId = "";

  // check if summary object exist (each report is required to have a parent summary)

  const summaryQuery = `SELECT Id from CBO_Report_Summary__c WHERE Date__c = ${format(
    lastDay,
    "yyyy-MM-dd",
  )}`;

  const getSummaryUri = urls.SFQueryPrefix + encodeURIComponent(summaryQuery);

  const summaryQueryResult: { data: { records?: { Id: string }[] } } =
    await fetcher.get(getSummaryUri);

  if (!summaryQueryResult.data.records) {
    throw Error("Failed to get CBO summary object");
  }

  // create summary if it doesn't exist

  if (!summaryQueryResult.data.records.length) {
    const createSummaryUri = urls.SFOperationPrefix + "/CBO_Report_Summary__c";

    const newSummary = {
      Date__c: formatISO(lastDay),
      Name: `${format(lastDay, "LLLL")} ${year}`,
    };

    const insertSummaryResult: { data: { success: boolean; id: string } } =
      await fetcher.post(createSummaryUri, newSummary);

    if (!insertSummaryResult.data.success) {
      throw Error("Could not create parent summary object");
    }

    summaryId = insertSummaryResult.data.id;
  } else {
    summaryId = summaryQueryResult.data.records[0].Id;
  }

  CBOReportObject.CBO_Report_Summary__c = summaryId;

  const insertUri = urls.SFOperationPrefix + "/CBO_Report_Data__c";

  const { data }: { data?: { success: boolean } } = await fetcher.post(
    insertUri,
    CBOReportObject,
  );
  if (!data?.success) {
    throw Error("Unable to add data");
  }

  res.sendStatus(204);
});

export default router;
