import { regionKey } from '../../../text/textResponses';
import fetcher from '../../fetcher';
import urls from '../../urls';

interface TextSubscriber {
  Name?: string;
  Regions__c: string;
}

const regionToString = (regions: string[]) => {
  return regions.length ? regions.map((r) => regionKey[r]).join(';') + ';' : '';
};

export const editTextSubscriber = async (number: string, regions: string[]) => {
  await fetcher.setService('salesforce');

  const query = `SELECT Id from Text_Service_Subscriber__c WHERE Name = '${number}'`;
  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);
  const res = await fetcher.get(queryUri);
  if (!res.data?.records?.length) {
    throw Error('Text subscriber not found in salesforce');
  }
  const { Id } = res.data.records[0];
  const regionsString = regionToString(regions);
  const patchUri = urls.SFOperationPrefix + '/Text_Service_Subscriber__c/' + Id;
  const patchData: TextSubscriber = {
    Regions__c: regionsString,
  };
  await fetcher.patch(patchUri, patchData);
};

export const addTextSubscriber = async (number: string, regions: string[]) => {
  await fetcher.setService('salesforce');
  const insertUri = urls.SFOperationPrefix + '/Text_Service_Subscriber__c';
  const regionsString = regionToString(regions);
  const insertData: TextSubscriber = {
    Name: number,
    Regions__c: regionsString,
  };
  const { data }: { data: { success?: boolean } } = await fetcher.post(
    insertUri,
    insertData
  );
  if (!data.success) {
    throw Error('Unable to insert new text subscriber');
  }
};
