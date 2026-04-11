import node_geocoder from "node-geocoder";

import getSecrets from "../../getSecrets";
import fetcher from "../../fetcher";
import urls from "../../urls";
import { getPlaceDetails } from "../../googleApis/getPlaceDetails";

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
