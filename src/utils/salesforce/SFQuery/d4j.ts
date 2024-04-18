import fetcher from '../../fetcher';
import urls from '../../urls';

interface CreateD4JCheckInObject {
  Contact__c: string;
  Restaurant__c: string;
  Date__c: Date;
}

interface D4JCheckIn {
  Contact__c: string;
  Id: string;
}

// D4J check ins have a status of "Valid", "Spent" or "Winner"

export const createD4jCheckIn = async ({
  contactId,
  restaurantId,
}: {
  contactId: string;
  restaurantId: string;
}): Promise<string> => {
  await fetcher.setService('salesforce');

  const createUri = urls.SFOperationPrefix + '/D4J_Check_In__c';

  const createData: CreateD4JCheckInObject = {
    Date__c: new Date(),
    Contact__c: contactId,
    Restaurant__c: restaurantId,
  };

  const { data } = await fetcher.post(createUri, createData);
  if (!data.success) {
    throw Error('Could not create D4J Check In');
  }
  return data.id;
};

export const updateD4jCheckInsAsSpent = async (ids: string[]) => {
  await fetcher.setService('salesforce');

  const promises = ids.map((id) => {
    return fetcher.patch(urls.SFOperationPrefix + '/D4J_Check_In__c/' + id, {
      Status__c: 'Spent',
    });
  });
  await Promise.all(promises);
};

export const updateD4jCheckInAsWinner = async (id: string) => {
  await fetcher.setService('salesforce');

  await fetcher.patch(urls.SFOperationPrefix + '/D4J_Check_In__c/' + id, {
    Status__c: 'Winner',
  });
};

export const deleteAllUserCheckIns = async (ids: string[]) => {
  await fetcher.setService('salesforce');

  const promises = ids.map((id) => {
    fetcher.delete(urls.SFOperationPrefix + '/D4J_Check_In__c/' + id);
  });

  await Promise.all(promises);
};

export const getValidD4jCheckIns = async () => {
  await fetcher.setService('salesforce');

  const query =
    "SELECT Contact__c, Id from D4J_Check_In__c where Status__c = 'Valid'";

  const { data }: { data: { records?: D4JCheckIn[] } } = await fetcher.get(
    urls.SFQueryPrefix + encodeURIComponent(query)
  );

  if (!data.records) {
    throw Error('Could not fetch check-ins');
  }

  return data.records;
};

export const getD4JEvents = async () => {
  await fetcher.setService('salesforce');

  const query =
    'SELECT Id, Name, StartDate from Campaign WHERE ParentId = placeholder AND StartDate >= TODAY';

  const { data } = await fetcher.get(
    urls.SFQueryPrefix + encodeURIComponent(query)
  );

  return data.records;
};
