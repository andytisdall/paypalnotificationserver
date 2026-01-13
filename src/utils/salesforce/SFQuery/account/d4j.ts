import node_geocoder from "node-geocoder";

import getSecrets from "../../../getSecrets";
import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { getPlaceDetails } from "../../../googleApis/getPlaceDetails";
import { FormattedD4JRestaurant, UnformattedD4JRestaurant } from "./types";
import createQuery, { FilterGroup } from "../queryCreator";

const getCoords = (latitude?: number, longitude?: number) => {
  if (latitude && longitude) {
    return { latitude, longitude };
  }
};

export const updateDetails = async (restaurantId: string) => {
  await fetcher.setService("salesforce");

  const uri = urls.SFOperationPrefix + "/Account/" + restaurantId;

  const { data } = await fetcher.get(uri);

  if (!data) {
    throw Error("Restaurant Not Found");
  }

  const details = await getPlaceDetails(data.Google_ID__c);

  // check existence of geocoordinates and matching open hours
  if (!data.Geolocation__c?.latitude || !data.Geolocation__c.longitude) {
    const { GOOGLE_MAPS_API_KEY } = await getSecrets(["GOOGLE_MAPS_API_KEY"]);

    const geocoder = node_geocoder({
      provider: "google",
      apiKey: GOOGLE_MAPS_API_KEY,
    });

    const coords = await geocoder.geocode(details.address);
    await fetcher.patch(uri, {
      Geolocation__latitude__s: coords[0].latitude,
      Geolocation__longitude__s: coords[0].longitude,
      Open_Hours__c: details.openHours?.join("_"),
    });
  }

  if (details.openHours?.join("_") !== data.Open_Hours__c) {
    console.log("Updating open hours: " + data.Name);

    await fetcher.patch(uri, {
      Open_Hours__c: details.openHours?.join("_"),
    });
  }

  if (details.url !== data.Website) {
    await fetcher.patch(uri, {
      Website: details.url,
    });
  }
};

const formatAccount = (
  account: UnformattedD4JRestaurant,
  cocktails?: boolean
): FormattedD4JRestaurant => {
  return {
    name: account.Name,
    id: account.Id,
    pocOwned: account.Minority_Owned__c,
    femaleOwned: account.Female_Owned__c,
    vegan: account.Restaurant_Vegan__c,
    cuisine: cocktails ? "cocktails" : account.Type_of_Food__c,
    googleId: account.Google_ID__c,
    coords: getCoords(
      account.Geolocation__c?.latitude,
      account.Geolocation__c?.longitude
    ),
    openHours: account.Open_Hours__c?.split("_"),
    photo: account.Photo_URL__c,
    cocktailName: account.Cocktail_Name__c,
    cocktailDescription: account.Cocktail_Description__c,
    cocktail2Name: account.Cocktail_2_Name__c,
    cocktail2Description: account.Cocktail_2_Description__c,
    status: account.D4J_Status__c || "Former",
    closed: account.Closed__c,
    url: account.Website,
  };
};

export const getD4jRestaurants = async (): Promise<
  FormattedD4JRestaurant[]
> => {
  const fields = [
    "Id",
    "Name",
    "BillingAddress",
    "Google_ID__c",
    "Minority_Owned__c",
    "Type_of_Food__c",
    "Restaurant_Vegan__c",
    "Female_Owned__c",
    "Geolocation__c",
    "Open_Hours__c",
    "Photo_URL__c",
    "D4J_Status__c",
    "Closed__c",
    "Website",
  ] as const;
  const obj = "Account";
  const filters: FilterGroup<UnformattedD4JRestaurant> = {
    OR: [
      { field: "D4J_Status__c", value: "Active" },
      { field: "D4J_Status__c", value: "Former" },
      { field: "D4J_Status__c", value: "Paused" },
    ],
  };

  const accounts = await createQuery<
    UnformattedD4JRestaurant,
    (typeof fields)[number]
  >({ fields, obj, filters });

  return accounts.map((account) => formatAccount(account));
};
