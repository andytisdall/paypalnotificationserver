import { format, toZonedTime } from "date-fns-tz";

import fetcher from "../../fetcher";
import urls from "../../urls";
import { NewMobileOasisDelivery } from "./types";
import { UnformattedMealDelivery } from "./types";

export const createScheduledDelivery = async (
  delivery: NewMobileOasisDelivery,
) => {
  await fetcher.setService("salesforce");
  const insertUri = urls.SFOperationPrefix + "/Meal_Program_Delivery__c";

  const newDelivery: UnformattedMealDelivery = {
    Date__c: new Date().toISOString(),
    CBO__c: urls.townFridgeAccountId,
    Restaurant__c: urls.ckKitchenAccountId,
    TextTime__c: format(
      toZonedTime(new Date(), "America/Los_Angeles"),
      "HH:mm:ss.SSS",
    ),
    Delivery_Method__c: "CK Pickup",
    Number_of_Meals_Meat__c: delivery.numberOfMealsMeat,
    Number_of_Meals_Veg__c: delivery.numberOfMealsVeg,
    Delivery_Notes__c: "Added by mobile oasis driver",
    Funding_Source__c: "CK",
  };

  await fetcher.post(insertUri, newDelivery);
};
