import axios from 'axios';

import urls from './urls';
import getSecrets from './getSecrets';

export const getPlaceDetails = async (id: string) => {
  const { GOOGLE_MAPS_API_KEY } = await getSecrets(['GOOGLE_MAPS_API_KEY']);
  if (!GOOGLE_MAPS_API_KEY) {
    throw Error('API key not found');
  }

  const fields = [
    'displayName',
    'regularOpeningHours',
    'websiteUri',
    'primaryTypeDisplayName',
    'types',
    'servesBreakfast',
    'servesCocktails',
    'servesVegetarianFood',
  ];

  const getUri = urls.googleMaps + '/' + id;

  const { data } = await axios.get(getUri, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': fields.join(','),
      'Content-Type': 'application/json',
    },
  });
  return data;
};
