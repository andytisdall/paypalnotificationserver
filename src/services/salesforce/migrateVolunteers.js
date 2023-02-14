const axios = require('axios');
const passwordGenerator = require('generate-password');

const urls = require('../urls');
const getSFToken = require('./getSFToken');
const { User } = require('../../auth/models/user');

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

// const updateContactsToInvited = async () => {
//   const contacts = [
//     '0038Z000035F5YvQAK',
//     '0038Z000035IGpwQAG',
//     '0038Z000035IBTxQAO',
//     '0038Z000035IBTyQAO',
//     '0038Z000035IBTzQAO',
//     '0038Z000035IBU0QAO',
//     '0038Z000035IBU1QAO',
//     '0038Z000035IBU2QAO',
//     '0038Z000035IBU3QAO',
//     '0038Z000035IBU4QAO',
//     '0038Z000035IBU5QAO',
//     '0038Z000035IBU6QAO',
//     '0038Z000035IBU7QAO',
//     '0038Z000035IBU8QAO',
//     '0038Z000035IBU9QAO',
//     '0038Z000035IBUAQA4',
//     '0038Z000035IBUBQA4',
//     '0038Z000035IBUCQA4',
//     '0038Z000035IBUDQA4',
//     '0038Z000035IBUEQA4',
//     '0038Z000035IBUFQA4',
//     '0038Z000035IBUGQA4',
//     '0038Z000035IBUHQA4',
//     '0038Z00002z1r9yQAA',
//     '0038Z00002z1r9zQAA',
//     '0038Z00002z2QJ3QAM',
//     '0038Z000035Gsz0QAC',
//     '0038Z000035GszjQAC',
//     '0038Z000035Gsy7QAC',
//     '0038Z000035GuaPQAS',
//     '0038Z000035GKPyQAO',
//     '0038Z000035GKUPQA4',
//     '0038Z000035GLDkQAO',
//     '0038Z000035GKu1QAG',
//     '0038Z000035GKu2QAG',
//     '0038Z000035GKu3QAG',
//     '0038Z000035GKv8QAG',
//     '0038Z000035GKuDQAW',
//     '0038Z000035GKu4QAG',
//     '0038Z000035GKu5QAG',
//     '0038Z000035GKu6QAG',
//     '0038Z000035GKu7QAG',
//     '0038Z000035GKu8QAG',
//     '0038Z000035GKu9QAG',
//     '0038Z000035GKuAQAW',
//     '0038Z000035GKuBQAW',
//     '0038Z000035GKuCQAW',
//     '0038Z00002z3DeJQAU',
//     '0038Z000035HOIMQA4',
//     '0038Z000030UTrhQAG',
//     '0038Z000030UYB1QAO',
//     '0038Z000030UY9sQAG',
//     '0038Z000030UYCZQA4',
//     '0038Z000030UYCYQA4',
//     '0038Z000035GKPjQAO',
//     '0038Z000032klx1QAA',
//     '0038Z000035GL1eQAG',
//     '0038Z000030Unt4QAC',
//     '0038Z000030Us0cQAC',
//     '0038Z000032k1DYQAY',
//     '0038Z000032lCRcQAM',
//     '0038Z000032moNQQAY',
//     '0038Z000032moNRQAY',
//     '0038Z000032moNSQAY',
//     '0038Z000032moNTQAY',
//     '0038Z000032moNUQAY',
//     '0038Z000032moNVQAY',
//     '0038Z000032moNWQAY',
//     '0038Z000032moNXQAY',
//     '0038Z000032moNYQAY',
//     '0038Z000032moNZQAY',
//     '0038Z000032moNaQAI',
//     '0038Z000032moNbQAI',
//     '0038Z000032moNcQAI',
//     '0038Z000032moNdQAI',
//     '0038Z000032moNeQAI',
//   ];

//   const token = await getSFToken();
//   axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

//   const promises = contacts.map(async (id) => {
//     const contactUpdateUri = urls.SFOperationPrefix + '/Contact/' + id;
//     await axiosInstance.patch(contactUpdateUri, {
//       Home_Chef_Status__c: 'Invited to Orientation',
//     });
//     console.log();
//   });

//   await Promise.all(promises);
// };

module.exports = migrate;
