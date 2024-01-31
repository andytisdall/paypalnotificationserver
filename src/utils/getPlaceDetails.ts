import axios from 'axios';
import node_geocoder from 'node-geocoder';

import urls from './urls';
import getSecrets from './getSecrets';

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

interface FormattedPlaceDetails {
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
): Promise<FormattedPlaceDetails | undefined> => {
  if (!id) {
    return;
  }
  const { GOOGLE_MAPS_API_KEY } = await getSecrets(['GOOGLE_MAPS_API_KEY']);
  if (!GOOGLE_MAPS_API_KEY) {
    throw Error('API key not found');
  }

  const fields = [
    'shortFormattedAddress',
    'regularOpeningHours',
    'websiteUri',
    'servesBreakfast',
    'servesCocktails',
    'servesWine',
    'servesBeer',
  ];

  const getUri = urls.googleMaps + '/' + id;

  const { data }: { data: UnformattedPlaceDetails } = await axios.get(getUri, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': fields.join(','),
      'Content-Type': 'application/json',
    },
  });

  // console.log(data);

  // get salesforce info
  // compare coords and hours to salesforce info
  // update salesforce info if necessary

  // const geocoder = node_geocoder({
  //   provider: 'google',
  //   apiKey: GOOGLE_MAPS_API_KEY,
  // });

  // const coords = await geocoder.geocode(data.shortFormattedAddress);
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
    // coords: coords[0],
    address: data.shortFormattedAddress,
    id,
  };
};
