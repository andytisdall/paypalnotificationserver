import node_geocoder from 'node-geocoder';

import fetcher from '../../fetcher';
import urls from '../../urls';
import getSecrets from '../../getSecrets';
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
}

export interface FormattedD4JRestaurant {
  name: string;
  id: string;
  tags?: string[];
  photo?: string;
  neighborhood?: string;
  cuisine?: string;
  address?: AccountAddress;
  coords?: { latitude?: number; longitude?: number };
  pocOwned?: string;
  underservedNeighborhood: boolean;
  vegan: boolean;
  femaleOwned: boolean;
}

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
  const { GOOGLE_MAPS_API_KEY } = await getSecrets(['GOOGLE_MAPS_API_KEY']);

  await fetcher.setService('salesforce');

  const query = `SELECT Id, Name, BillingAddress, Google_ID__c, Minority_Owned__c, Restaurant_Underserved_Neighborhood__c, Type_of_Food__c, Restaurant_Vegan__c, Female_Owned__c FROM Account WHERE D4J_Status__c = 'Active'`;

  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const { data }: { data: { records?: UnformattedD4JRestaurant[] } } =
    await fetcher.get(queryUri);

  if (!data.records) {
    throw Error('Could not get restaurants');
  }

  const geocoder = node_geocoder({
    provider: 'google',
    apiKey: GOOGLE_MAPS_API_KEY,
  });

  const promises = data.records.map(async (account) => {
    const address = account.BillingAddress;

    const combinedAddress = `${address!.street}, ${address!.city}, ${
      address!.state
    }, ${address!.postalCode}`;

    const coords = await geocoder.geocode(combinedAddress);
    const details = await getPlaceDetails(account.Google_ID__c);
    return {
      name: account.Name,
      id: account.Id,
      address,
      coords: coords[0],
      details,
      pocOwned: account.Minority_Owned__c,
      femaleOwned: account.Female_Owned__c,
      vegan: account.Restaurant_Vegan__c,
      underservedNeighborhood: account.Restaurant_Underserved_Neighborhood__c,
      cuisine: account.Type_of_Food__c,
    };
  });
  return Promise.all(promises);
};
