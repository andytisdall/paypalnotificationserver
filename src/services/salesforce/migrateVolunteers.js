const axios = require('axios');
const passwordGenerator = require('generate-password');

const urls = require('../urls');
const getSFToken = require('./getSFToken');
const { User } = require('../../models/user');

const axiosInstance = axios.create({
  baseURL: urls.salesforce,
});

const migrate = async () => {
  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

  const contacts = await getContacts();

  const promises = contacts.map(updateContact, axiosInstance);
  await Promise.all(promises);
};

const updateContact = async (contact) => {
  const username =
    contact.FirstName.charAt(0).toLowerCase() + contact.LastName.toLowerCase();
  const temporaryPassword = passwordGenerator.generate({
    length: 10,
    numbers: true,
  });

  const contactUpdateUri = urls.SFOperationPrefix + '/Contact/' + contact.Id;
  await axiosInstance.patch(contactUpdateUri, {
    Portal_Username__c: username,
    Portal_Temporary_Password__c: temporaryPassword,
  });

  await createUser({ ...contact, username, temporaryPassword });
};

const createUser = async (contact) => {
  const newUser = new User({
    username: contact.username,
    password: contact.temporaryPassword,
    householdId: contact.npsp__HHId__c,
    salesforceId: contact.Id,
  });
  await newUser.save();
};

const getContacts = async () => {
  const query =
    "SELECT Id, FirstName, LastName, npsp__HHId__c from Contact WHERE Home_Chef_Status__c = 'Prospective'";

  const contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);
  try {
    const contactQueryResponse = await axiosInstance.get(contactQueryUri);
    return contactQueryResponse.data.records;
  } catch (err) {
    console.log(err);
  }
};

module.exports = migrate;
