import axios from 'axios';

import urls from './urls';
import getSecrets from './getSecrets';

interface UnformattedPlaceDetails {
  displayName: { text: string };
  websiteUri: string;
  regularOpeningHours: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
  primaryTypeDisplayName: { text: string };
  servesBreakfast: boolean;
  servesVegetarianFood: boolean;
  servesCocktails: boolean;
  servesBeer: boolean;
}

interface FormattedPlaceDetails {
  name: string;
  url: string;
  openNow: boolean;
  openHours: string[];
  type: string;
  serves: {
    breakfast: boolean;
    vegetarian: boolean;
    cocktails: boolean;
    beer: boolean;
  };
}

export const getPlaceDetails = async (
  id: string
): Promise<FormattedPlaceDetails> => {
  const { GOOGLE_MAPS_API_KEY } = await getSecrets(['GOOGLE_MAPS_API_KEY']);
  if (!GOOGLE_MAPS_API_KEY) {
    throw Error('API key not found');
  }

  const fields = [
    'displayName',
    'regularOpeningHours',
    'websiteUri',
    'primaryTypeDisplayName',
    'servesBreakfast',
    'servesCocktails',
    'servesVegetarianFood',
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
  return {
    name: data.displayName.text,
    type: data.primaryTypeDisplayName.text,
    url: data.websiteUri,
    openNow: data.regularOpeningHours.openNow,
    openHours: data.regularOpeningHours.weekdayDescriptions,
    serves: {
      breakfast: data.servesBreakfast,
      beer: data.servesBeer,
      cocktails: data.servesCocktails,
      vegetarian: data.servesVegetarianFood,
    },
  };
};
