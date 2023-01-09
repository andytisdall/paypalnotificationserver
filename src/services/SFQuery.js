const getContact = async (lastName, email, axiosInstance) => {
  const query = `SELECT Name, npsp__HHId__c, Id from Contact WHERE LastName = '${lastName}' AND Email = '${email}'`;

  const contactQueryUri = '/data/v56.0/query/?q=' + encodeURIComponent(query);

  const contactQueryResponse = await axiosInstance.get(contactQueryUri);
  if (contactQueryResponse.data.totalSize !== 0) {
    return contactQueryResponse.data.records[0];
  }
};

const addContact = async (contactToAdd, axiosInstance) => {
  const contactInsertUri = '/data/v56.0/sobjects/Contact';
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

module.exports = { getContact, addContact };
