import node_geocoder from 'node-geocoder';

import getSecrets from '../../getSecrets';
import fetcher from '../../fetcher';
import urls from '../../urls';
import { getPlaceDetails } from '../../getPlaceDetails';

export interface AccountAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface UnformattedRestaurant {
  Meal_Program_Onboarding__c: string;
  Meal_Program_Status__c: string;
  Health_Department_Expiration_Date__c: string;
  Name: string;
  Id: string;
  Billing_Address: AccountAddress;
}

export interface Restaurant {
  onboarding: string;
}

export interface UnformattedD4JRestaurant {
  Name: string;
  Id: string;
  BillingAddress: AccountAddress;
  Google_ID__c: string;
  Minority_Owned__c?: string;
  Restaurant_Underserved_Neighborhood__c: boolean;
  Restaurant_Vegan__c: boolean;
  Female_Owned__c: boolean;
  Type_of_Food__c?: string;
  Open_Hours__c?: string;
  Geolocation__c?: { latitude: number; longitude: number };
  Photo_URL__c?: string;
  Cocktail_Name__c?: string;
  Cocktail_Description__c?: string;
  Cocktail_2_Name__c?: string;
  Cocktail_2_Description__c?: string;
  D4J_Status__c?: 'Active' | 'Former' | 'Paused';
  Closed__c?: boolean;
}

type Coordinates = { latitude: number; longitude: number };

export interface FormattedD4JRestaurant {
  name: string;
  id: string;
  neighborhood?: string;
  cuisine?: string;
  pocOwned?: string;
  underservedNeighborhood: boolean;
  vegan: boolean;
  femaleOwned: boolean;
  googleId: string;
  coords?: Coordinates;
  openHours?: string[];
  photo?: string;
  cocktailName?: string;
  cocktailDescription?: string;
  cocktail2Name?: string;
  cocktail2Description?: string;
  status?: 'Active' | 'Former' | 'Paused';
  closed?: boolean;
}

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
    console.log('Updating geocoordinates: ' + data.Name);

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
    underservedNeighborhood: account.Restaurant_Underserved_Neighborhood__c,
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
  };
};

export const getAccountById = async (id: string) => {
  await fetcher.setService('salesforce');
  const res: { data: UnformattedRestaurant | undefined } = await fetcher.get(
    urls.SFOperationPrefix + '/Account/' + id
  );
  if (!res.data) {
    throw Error('Could not fetch restaurant');
  }
  return res.data;
};

export const getD4jRestaurants = async (): Promise<
  FormattedD4JRestaurant[]
> => {
  await fetcher.setService('salesforce');

  const query = `SELECT Id, Name, BillingAddress, Google_ID__c, Minority_Owned__c, Restaurant_Underserved_Neighborhood__c, Type_of_Food__c, Restaurant_Vegan__c, Female_Owned__c, Geolocation__c, Open_Hours__c, Photo_URL__c, D4J_Status__c, Closed__c FROM Account WHERE D4J_Status__c = 'Active' OR D4J_Status__c = 'Former' OR D4J_Status__c = 'Paused'`;

  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const { data }: { data: { records?: UnformattedD4JRestaurant[] } } =
    await fetcher.get(queryUri);

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

  const accountQuery = `SELECT Id, Name, BillingAddress, Google_ID__c, Minority_Owned__c, Restaurant_Underserved_Neighborhood__c, Type_of_Food__c, Restaurant_Vegan__c, Female_Owned__c, Geolocation__c, Open_Hours__c, Photo_URL__c, Cocktail_Name__c, Cocktail_Description__c, Cocktail_2_Name__c, Cocktail_2_Description__c, Closed__c FROM Account WHERE Id IN ${stringOfBarIds}`;

  const res: { data?: { records?: UnformattedD4JRestaurant[] } } =
    await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(accountQuery));

  if (!res.data?.records) {
    throw Error('Could not get account info');
  }

  return res.data.records.map((account) => formatAccount(account, false));
};

export const getStyleWeekBars = async () => {
  await fetcher.setService('salesforce');

  const campaignMemberQuery = `SELECT AccountId from CampaignMember WHERE CampaignId = '${urls.styleWeekCampaignId}'`;

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

  const accountQuery = `SELECT Id, Name, BillingAddress, Google_ID__c, Minority_Owned__c, Restaurant_Underserved_Neighborhood__c, Type_of_Food__c, Restaurant_Vegan__c, Female_Owned__c, Geolocation__c, Open_Hours__c, Photo_URL__c, Cocktail_Name__c, Cocktail_Description__c, Cocktail_2_Name__c, Cocktail_2_Description__c, Closed__c FROM Account WHERE Id IN ${stringOfBarIds}`;

  const res: { data?: { records?: UnformattedD4JRestaurant[] } } =
    await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(accountQuery));

  if (!res.data?.records) {
    throw Error('Could not get account info');
  }

  return res.data.records.map((account) => formatAccount(account));
};
