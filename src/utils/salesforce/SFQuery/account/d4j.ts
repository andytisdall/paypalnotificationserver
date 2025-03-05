import node_geocoder from 'node-geocoder';

import getSecrets from '../../../getSecrets';
import fetcher from '../../../fetcher';
import urls from '../../../urls';
import { getPlaceDetails } from '../../../getPlaceDetails';
import { FormattedD4JRestaurant, UnformattedD4JRestaurant } from './types';

const getCoords = (latitude?: number, longitude?: number) => {
  if (latitude && longitude) {
    return { latitude, longitude };
  }
};

export const updateDetails = async (restaurantId: string) => {
  await fetcher.setService('salesforce');

  const uri = urls.SFOperationPrefix + '/Account/' + restaurantId;

  const { data } = await fetcher.get(uri);

  if (!data) {
    throw Error('Restaurant Not Found');
  }

  const details = await getPlaceDetails(data.Google_ID__c);

  // check existence of geocoordinates and matching open hours
  if (!data.Geolocation__c?.latitude || !data.Geolocation__c.longitude) {
    const { GOOGLE_MAPS_API_KEY } = await getSecrets(['GOOGLE_MAPS_API_KEY']);

    const geocoder = node_geocoder({
      provider: 'google',
      apiKey: GOOGLE_MAPS_API_KEY,
    });

    const coords = await geocoder.geocode(details.address);
    await fetcher.patch(uri, {
      Geolocation__latitude__s: coords[0].latitude,
      Geolocation__longitude__s: coords[0].longitude,
      Open_Hours__c: details.openHours?.join('_'),
    });
  }

  if (details.openHours?.join('_') !== data.Open_Hours__c) {
    console.log('Updating open hours: ' + data.Name);

    await fetcher.patch(uri, {
      Open_Hours__c: details.openHours?.join('_'),
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
    cuisine: cocktails ? 'cocktails' : account.Type_of_Food__c,
    googleId: account.Google_ID__c,
    coords: getCoords(
      account.Geolocation__c?.latitude,
      account.Geolocation__c?.longitude
    ),
    openHours: account.Open_Hours__c?.split('_'),
    photo: account.Photo_URL__c,
    cocktailName: account.Cocktail_Name__c,
    cocktailDescription: account.Cocktail_Description__c,
    cocktail2Name: account.Cocktail_2_Name__c,
    cocktail2Description: account.Cocktail_2_Description__c,
    status: account.D4J_Status__c || 'Former',
    closed: account.Closed__c,
    url: account.Website,
  };
};

export const getD4jRestaurants = async (): Promise<
  FormattedD4JRestaurant[]
> => {
  await fetcher.setService('salesforce');

  const query = `SELECT Id, Name, BillingAddress, Google_ID__c, Minority_Owned__c, Type_of_Food__c, Restaurant_Vegan__c, Female_Owned__c, Geolocation__c, Open_Hours__c, Photo_URL__c, D4J_Status__c, Closed__c, Website FROM Account WHERE D4J_Status__c = 'Active' OR D4J_Status__c = 'Former' OR D4J_Status__c = 'Paused'`;

  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const {
    data,
  }: {
    data: {
      records?: Pick<
        UnformattedD4JRestaurant,
        | 'Id'
        | 'Name'
        | 'BillingAddress'
        | 'Google_ID__c'
        | 'Minority_Owned__c'
        | 'Type_of_Food__c'
        | 'Restaurant_Vegan__c'
        | 'Female_Owned__c'
        | 'Geolocation__c'
        | 'Open_Hours__c'
        | 'Photo_URL__c'
        | 'D4J_Status__c'
        | 'Closed__c'
        | 'Website'
      >[];
    };
  } = await fetcher.get(queryUri);

  if (!data.records) {
    throw Error('Could not get restaurants');
  }

  return data.records.map((account) => formatAccount(account));
};

export const getBars = async () => {
  await fetcher.setService('salesforce');

  const campaignMemberQuery = `SELECT AccountId from CampaignMember WHERE CampaignId = '${urls.cocktailsCampaignId}' AND HasResponded = True`;

  const { data } = await fetcher.get(
    urls.SFQueryPrefix + encodeURIComponent(campaignMemberQuery)
  );

  if (!data?.records) {
    throw Error('Could not get campaign members');
  }
  const arrayOfBarIds = data.records.map(
    (rec: { AccountId: string }) => rec.AccountId
  );
  const stringOfBarIds = "('" + arrayOfBarIds.join("','") + "')";

  const accountQuery = `SELECT Id, Name, BillingAddress, Google_ID__c, Minority_Owned__c, Restaurant_Underserved_Neighborhood__c, Type_of_Food__c, Restaurant_Vegan__c, Female_Owned__c, Geolocation__c, Open_Hours__c, Photo_URL__c, Cocktail_Name__c, Cocktail_Description__c, Cocktail_2_Name__c, Website, Cocktail_2_Description__c, Closed__c FROM Account WHERE Id IN ${stringOfBarIds}`;

  const res: {
    data?: {
      records?: Pick<
        UnformattedD4JRestaurant,
        | 'Id'
        | 'Name'
        | 'BillingAddress'
        | 'Google_ID__c'
        | 'Minority_Owned__c'
        | 'Type_of_Food__c'
        | 'Restaurant_Vegan__c'
        | 'Female_Owned__c'
        | 'Geolocation__c'
        | 'Open_Hours__c'
        | 'Photo_URL__c'
        | 'D4J_Status__c'
        | 'Closed__c'
        | 'Website'
      >[];
    };
  } = await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(accountQuery));

  if (!res.data?.records) {
    throw Error('Could not get account info');
  }

  return res.data.records.map((account) => formatAccount(account, false));
};
