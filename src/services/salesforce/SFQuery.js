const urls = require('../urls');

const getContact = async (lastName, email, axiosInstance) => {
  const query = `SELECT Name, npsp__HHId__c, Id from Contact WHERE LastName = '${lastName}' AND Email = '${email}'`;

  const contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const contactQueryResponse = await axiosInstance.get(contactQueryUri);
  if (contactQueryResponse.data.totalSize !== 0) {
    return contactQueryResponse.data.records[0];
  }
};

const addContact = async (contactToAdd, axiosInstance) => {
  const contactInsertUri = urls.SFOperationPrefix + '/Contact';
  const insertRes = await axiosInstance.post(contactInsertUri, contactToAdd);
  //Query new contact to get household account number for opp
  if (insertRes.data.success) {
    const newContact = await axiosInstance.get(
      contactInsertUri + '/' + insertRes.data.id
    );
    return {
      Id: newContact.data.Id,
      npsp__HHId__c: newContact.data.npsp__HHId__c,
    };
  } else {
    throw new Error('Unable to insert contact!');
  }
};

const updateContact = async (id, contactToUpdate, axiosInstance) => {
  const contactUpdateUri = urls.SFOperationPrefix + '/Contact/' + id;
  await axiosInstance.patch(contactUpdateUri, contactToUpdate);
};

module.exports = { getContact, addContact, updateContact };
