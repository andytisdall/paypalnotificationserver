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
  await fetcher.setService('salesforce');

  const query = `SELECT Id, Name, BillingAddress, Google_ID__c, Minority_Owned__c, Restaurant_Underserved_Neighborhood__c, Type_of_Food__c, Restaurant_Vegan__c, Female_Owned__c, Geolocation__c, Open_Hours__c  FROM Account WHERE D4J_Status__c = 'Active'`;

  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const { data }: { data: { records?: UnformattedD4JRestaurant[] } } =
    await fetcher.get(queryUri);

  if (!data.records) {
    throw Error('Could not get restaurants');
  }

  // const promises = data.records.map(async (rest) => {
  //   const updateUri = urls.SFOperationPrefix + '/Account/' + rest.Id;
  //   const details = await getPlaceDetails(rest.Google_ID__c);
  //   if (details?.coords?.latitude && details?.coords?.longitude) {
  //     await fetcher.patch(updateUri, {
  //       Geolocation__latitude__s: details.coords.latitude,
  //       Geolocation__longitude__s: details.coords.longitude,
  //       Open_Hours__c: details.openHours.join('_'),
  //     });
  //   }
  // });

  // await Promise.all(promises);

  const getCoords = (latitude?: number, longitude?: number) => {
    if (latitude && longitude) {
      return { latitude, longitude };
    }
  };

  return data.records.map((account) => {
    return {
      name: account.Name,
      id: account.Id,
      pocOwned: account.Minority_Owned__c,
      femaleOwned: account.Female_Owned__c,
      vegan: account.Restaurant_Vegan__c,
      underservedNeighborhood: account.Restaurant_Underserved_Neighborhood__c,
      cuisine: account.Type_of_Food__c,
      googleId: account.Google_ID__c,
      coords: getCoords(
        account.Geolocation__c?.latitude,
        account.Geolocation__c?.longitude
      ),
      openHours: account.Open_Hours__c?.split('_'),
    };
  });
};
