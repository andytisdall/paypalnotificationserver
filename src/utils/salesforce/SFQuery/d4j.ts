import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

import fetcher from '../../fetcher';
import urls from '../../urls';

interface CreateD4JVisitObject {
  Contact__c: string;
  Restaurant__c: string;
  Date__c: string;
  Name: string;
}

export const createD4jVisit = async ({
  contactId,
  restaurantId,
  date,
}: {
  contactId: string;
  restaurantId: string;
  date: string;
}) => {
  await fetcher.setService('salesforce');

  const createUri = urls.SFOperationPrefix + '/D4J_Visit__c';

  const formattedDate = format(
    zonedTimeToUtc(date, 'America/Los_Angeles'),
    'M/d/yy'
  );

  const name = `D4J Visit - ${formattedDate}`;

  const createData: CreateD4JVisitObject = {
    Date__c: date,
    Contact__c: contactId,
    Restaurant__c: restaurantId,
    Name: name,
  };

  const { data } = await fetcher.post(createUri, createData);
  if (!data.success) {
    throw Error('Could not create D4J Visit');
  }
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
