import axios from "axios";

import urls from "../urls";
import getSecrets from "../getSecrets";

interface UnformattedPlaceDetails {
  websiteUri: string;
  regularOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
  servesBreakfast: boolean;
  servesWine: boolean;
  servesCocktails: boolean;
  servesBeer: boolean;
  shortFormattedAddress: string;
}

export interface FormattedPlaceDetails {
  url: string;
  openNow?: boolean;
  openHours?: string[];
  serves: {
    breakfast: boolean;
    wine: boolean;
    cocktails: boolean;
    beer: boolean;
  };
  coords?: { latitude?: number; longitude?: number };
  address: string;
  id: string;
}

export const getPlaceDetails = async (
  id: string
): Promise<FormattedPlaceDetails> => {
  const { GOOGLE_MAPS_API_KEY } = await getSecrets(["GOOGLE_MAPS_API_KEY"]);
  if (!GOOGLE_MAPS_API_KEY) {
    throw Error("API key not found");
  }

  const fields = [
    "shortFormattedAddress",
    "regularOpeningHours",
    "websiteUri",
    "servesBreakfast",
    "servesCocktails",
    "servesWine",
    "servesBeer",
  ];

  const getUri = urls.googlePlaceApi + "/" + id;

  const { data }: { data: UnformattedPlaceDetails } = await axios.get(getUri, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": fields.join(","),
      "Content-Type": "application/json",
    },
  });

  return {
    url: data.websiteUri,
    openNow: data.regularOpeningHours?.openNow,
    openHours: data.regularOpeningHours?.weekdayDescriptions,
    serves: {
      breakfast: data.servesBreakfast,
      beer: data.servesBeer,
      cocktails: data.servesCocktails,
      wine: data.servesWine,
    },
    address: data.shortFormattedAddress,
    id,
  };
};
