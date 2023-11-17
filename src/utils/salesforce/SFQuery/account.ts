import fetcher from '../../fetcher';
import urls from '../../urls';

export interface UnformattedRestaurant {
  Meal_Program_Onboarding__c: string;
  Meal_Program_Status__c: string;
  Health_Department_Expiration_Date__c: string;
  Name: string;
  Id: string;
  Billing_Address: string;
}

export interface Restaurant {
  onboarding: string;
}

export interface UnformattedD4JRestaurant {
  Name: string;
  Id: string;
}

export interface FormattedD4JRestaurant {
  name: string;
  id: string;
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

export const getD4jRestaurants = async () => {
  await fetcher.setService('salesforce');

  const query = `SELECT Id, Name FROM Account WHERE D4J_Status__c = 'Active'`;

  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const { data }: { data: { records?: UnformattedD4JRestaurant[] } } =
    await fetcher.get(queryUri);

  if (!data.records) {
    throw Error('Could not get restaurants');
  }

  return data.records.map((account) => {
    return { name: account.Name, id: account.Id };
  });
};
