import { CBOReportParams } from "../../salesforce/cbo/types";
import { formatDataObj } from "./CBOReportData";

export const createCBOSingleReport = (report: CBOReportParams) => {
  const races = {
    Black: report.race.raceAfrican,
    White: report.race.raceWhite,
    Asian: report.race.raceAsian,
    Latin: report.race.raceLatin,
    Other: report.race.raceOther,
    Unknown: report.race.raceUnknown,
  };

  const ages = {
    "0 - 17": report.age.age17,
    "18 - 26": report.age.age26,
    "27 - 49": report.age.age26,
    "50 - 60": report.age.age60,
    "Over 60": report.age.ageOver60,
    Unknown: report.age.ageUnknown,
  };

  const households = {
    "Households Provided Meals": report.households,
    "Individuals Provided Meals": report.individuals,
  };

  const performanceMeasures = {
    "Individuals without Access to Kitchen":
      report.performanceMeasures.withoutAccess,
    "Households that receive benefits or identify as low-income":
      report.performanceMeasures.lowIncome,
    "Meals Provided": report.performanceMeasures.mealsProvided,
    "Unusable Meals": report.performanceMeasures.unusable,
    "Number of Calfresh postcards given out":
      report.performanceMeasures.postcards,
    "Number of Calfresh applications assisted":
      report.performanceMeasures.calfreshApps,
    "Number of Calfresh applications sent to SSA":
      report.performanceMeasures.SSA,
  };

  return `
  Thank you for submitting your report to Community Kitchens. Here is the information you submitted for ${report.month} ${report.year}
  <ul>${formatDataObj(households)}</ul>
  <h4>Age</h4>
  <ul>${formatDataObj(ages)}</ul>
    <h4>Race</h4>
  <ul>${formatDataObj(races)}</ul>
    <h4>Performance Measures</h4>
  <ul>${formatDataObj(performanceMeasures)}</ul>
    <h4>Zip Codes</h4>
  <ul>${formatDataObj(report.zips)}</ul>
  `;
};
