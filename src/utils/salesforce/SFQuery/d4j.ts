import { format, formatISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

import fetcher from '../../fetcher';
import urls from '../../urls';
import { uploadFileToSalesforce } from './fileUpload';
import { FileMetaData } from '../../../files/salesforce/metadata';

interface CreateD4JVisitObject {
  Contact__c: string;
  Restaurant__c: string;
  Date__c: string;
  Name: string;
}

interface CreateD4JCheckInObject {
  Contact__c: string;
  Restaurant__c: string;
}

interface UnformattedD4JVisit {
  Restaurant__c: string;
  Id: string;
  Date__c: string;
  Verification_Status__c?: string;
}

interface FormattedD4JVisit {
  id: string;
  restaurant: string;
  date: string;
  status?: string;
}

export const createD4jVisit = async ({
  receipt,
  contactId,
  restaurantId,
  date,
}: {
  receipt: { data: Buffer; name: string };
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

  const metadata: FileMetaData = {
    title: name,
    description: 'receipt',
    folder: 'd4j',
  };

  await uploadFileToSalesforce(metadata, receipt, data.id);
};

export const getD4JVisits = async (
  contactId: string
): Promise<FormattedD4JVisit[]> => {
  await fetcher.setService('salesforce');
  const query = `SELECT Id, Restaurant__c, Date__c, Verification_Status__c FROM D4J_Visit__c WHERE Contact__c = '${contactId}' ORDER BY Date__c DESC`;

  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const { data }: { data: { records?: UnformattedD4JVisit[] } } =
    await fetcher.get(queryUri);

  if (!data.records) {
    throw Error('D4J Visit query failed');
  }

  return data.records.map((visit) => {
    return {
      id: visit.Id,
      restaurant: visit.Restaurant__c,
      date: visit.Date__c,
      status: visit.Verification_Status__c,
    };
  });
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

export const createD4jCheckIn = async ({
  contactId,
  restaurantId,
}: {
  contactId: string;
  restaurantId: string;
}) => {
  await fetcher.setService('salesforce');

  const createUri = urls.SFOperationPrefix + '/D4J_Check_In__c';

  const createData: CreateD4JCheckInObject = {
    Contact__c: contactId,
    Restaurant__c: restaurantId,
  };

  const { data } = await fetcher.post(createUri, createData);
  if (!data.success) {
    throw Error('Could not create D4J Check-In');
  }
};
