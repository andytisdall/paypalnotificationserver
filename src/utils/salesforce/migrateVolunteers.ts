import passwordGenerator from 'generate-password';
import mongoose from 'mongoose';

import urls from '../urls';
import fetcher from '../fetcher';
import { ContactInfo } from './SFQuery';

const User = mongoose.model('User');

const migrate = async () => {
  await fetcher.setService('salesforce');
  const contacts = await getActiveChefs();

  const promises = contacts.map(updateContact);
  await Promise.all(promises);
};

const updateContact = async (contact: ContactInfo) => {
  const username = (
    contact.FirstName!.charAt(0).toLowerCase() + contact.LastName!.toLowerCase()
  ).replace(' ', '');

  let uniqueUsername = username;
  let existingUser = await User.findOne({ username });
  let i = 1;
  while (existingUser) {
    uniqueUsername = username + i;
    existingUser = await User.findOne({ username: uniqueUsername });
    i++;
  }
  const temporaryPassword = passwordGenerator.generate({
    length: 10,
    numbers: true,
  });

  const contactUpdateUri = urls.SFOperationPrefix + '/Contact/' + contact.Id;

  await createUser({
    id: contact.Id!,
    username: uniqueUsername,
    password: temporaryPassword,
  });
  await fetcher.patch(contactUpdateUri, {
    Portal_Username__c: uniqueUsername,
    Portal_Temporary_Password__c: temporaryPassword,
  });
};

const createUser = async (contact: {
  id: string;
  password: string;
  username: string;
}) => {
  const newUser = new User({
    username: contact.username,
    password: contact.password,
    salesforceId: contact.id,
  });
  await newUser.save();
};

const getActiveChefs = async () => {
  const query =
    "SELECT Id, FirstName, LastName from Contact WHERE Home_Chef_Status__c = 'Active'";

  const contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const contactQueryResponse: { data: { records: ContactInfo[] } | undefined } =
    await fetcher.get(contactQueryUri);
  if (!contactQueryResponse.data) {
    throw Error('Did not get contacts');
  }
  return contactQueryResponse.data.records;
};

export default migrate;
