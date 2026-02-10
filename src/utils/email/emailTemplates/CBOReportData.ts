import { lastDayOfMonth, format } from "date-fns";

import urls from "../../urls";
import { CBOReportParams, ZipCode } from "../../salesforce/SFQuery/cboReport";
import { getPeriodCBOReports } from "../../salesforce/SFQuery/cboReport";
import { EmailMessage, sendBatchEmail } from "../email";

function sumField<T>(reportList: T[], field: keyof T) {
  return reportList.reduce((prev, cur) => prev + (cur[field] as number), 0);
}

function averageField<T>(
  reportList: CBOReportParams[],
  field: keyof CBOReportParams["performanceMeasures"],
) {
  const numberOfPeople = sumField(reportList, "individuals");
  if (numberOfPeople) {
    return Math.floor(
      (reportList.reduce(
        (prev, cur) =>
          prev +
          ((cur["performanceMeasures"][field] as number) / 100) *
            cur.individuals,
        0,
      ) /
        numberOfPeople) *
        100,
    );
  }
  return 0;
}

const getRace = (reports: CBOReportParams[]) => {
  const races = reports.map((r) => r.race);
  return {
    Black: sumField(races, "raceAfrican"),
    White: sumField(races, "raceWhite"),
    Asian: sumField(races, "raceAsian"),
    Latin: sumField(races, "raceLatin"),
    Other: sumField(races, "raceOther"),
    Unknown: sumField(races, "raceUnknown"),
  };
};

const getAge = (reports: CBOReportParams[]) => {
  const ages = reports.map((r) => r.age);
  return {
    "0 - 17": sumField(ages, "age17"),
    "18 - 26": sumField(ages, "age26"),
    "27 - 49": sumField(ages, "age26"),
    "50 - 60": sumField(ages, "age60"),
    "Over 60": sumField(ages, "ageOver60"),
    Unknown: sumField(ages, "ageUnknown"),
  };
};

const getHouseholds = (reports: CBOReportParams[]) => {
  return {
    "Households Provided Meals": sumField(reports, "households"),
    "Individuals Provided Meals": sumField(reports, "individuals"),
  };
};

const getPerformanceMeasures = (reports: CBOReportParams[]) => {
  const performanceMeasures = reports.map((r) => r.performanceMeasures);
  return {
    "Percent without Access to Kitchen": averageField(
      reports,
      "percentWOAccess",
    ),
    "Meals Provided": sumField(performanceMeasures, "mealsProvided"),
    "Unusable Meals": sumField(performanceMeasures, "unusable"),
    "Number of Calfresh postcards given out": sumField(
      performanceMeasures,
      "postcards",
    ),
    "Number of Calfresh applications assisted": sumField(
      performanceMeasures,
      "calfreshApps",
    ),
    "Number of Calfresh applications sent to SSA": sumField(
      performanceMeasures,
      "SSA",
    ),
  };
};

const getZips = (reports: CBOReportParams[]) => {
  const zips = reports.map((r) => r.zips);

  const obj: Partial<Record<ZipCode, number>> = {};
  if (zips[0]) {
    Object.keys(zips[0]).forEach((key) => {
      const sum = sumField(zips, key as ZipCode);
      obj[key as ZipCode] = sum;
    });
  }

  return obj;
};

const formatDataObj = (obj: Record<string, string | number>) => {
  let output = "";
  Object.keys(obj).forEach((key) => {
    output += `<li>${key}: ${obj[key]}</li>`;
  });
  return output;
};

const formatZips = (obj: Record<string, number>) => {
  let output = "";
  Object.keys(obj)
    .filter((key) => obj[key])
    .sort((a, b) => (obj[a] > obj[b] ? -1 : 1))
    .forEach((key) => {
      output += `<li>${key}: ${obj[key]}</li>`;
    });
  return output;
};

export const createCBOReportDataEmail = (reports: CBOReportParams[]) => {
  const age = getAge(reports);
  const race = getRace(reports);
  const households = getHouseholds(reports);
  const performanceMeasures = getPerformanceMeasures(reports);
  const zips = getZips(reports);

  return `
  <ul>${formatDataObj(households)}</ul>
  <h4>Age</h4>
  <ul>${formatDataObj(age)}</ul>
    <h4>Race</h4>
  <ul>${formatDataObj(race)}</ul>
    <h4>Performance Measures</h4>
  <ul>${formatDataObj(performanceMeasures)}</ul>
    <h4>Zip Codes</h4>
  <ul>${formatZips(zips)}</ul>
  `;
};

export const sendCBOReportDataEmail = async () => {
  const lastMonthStartDate = new Date();
  lastMonthStartDate.setDate(1);
  lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);
  const lastMonthEndDate = lastDayOfMonth(lastMonthStartDate);
  const lastMonthReports = await getPeriodCBOReports({
    startDate: lastMonthStartDate,
    endDate: lastMonthEndDate,
  });

  const yearToDateStartDate = new Date();
  yearToDateStartDate.setDate(1);
  yearToDateStartDate.setMonth(0);
  const yearToDateReports = await getPeriodCBOReports({
    startDate: new Date(2026, 0, 1),
    endDate: new Date(),
  });

  // const yearlyStartDate = new Date(2025, 0, 1);
  // const yearlyEndDate = new Date(2025, 11, 31);
  // const yearlyReports = await getPeriodCBOReports({
  //   startDate: yearlyStartDate,
  //   endDate: yearlyEndDate,
  // });

  const html =
    `<h1>CBO Report Data</h1><h2 style="textAlign: center">Last Month: ${format(
      lastMonthStartDate,
      "M/d/yy",
    )} - ${format(lastMonthEndDate, "M/d/yy")}</h2><h3>${
      lastMonthReports.length
    } Reports</h3>` +
    createCBOReportDataEmail(lastMonthReports) +
    "<br /><br />" +
    `<h2 style="textAlign: center">Year to Date: ${format(
      yearToDateStartDate,
      "M/d/yy",
    )} - ${format(new Date(), "M/d/yy")}</h2><h3>${
      yearToDateReports.length
    } Reports</h3>` +
    createCBOReportDataEmail(yearToDateReports);

  const msg: EmailMessage = {
    to: ["maria@ckoakland.org", "andy@ckoakland.org"],
    from: urls.adminEmail,
    subject: "Monthly CBO Report Data",
    html,
  };

  await sendBatchEmail(msg);
};
