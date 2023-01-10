const { Restaurant } = require('../models/restaurant.js');
const { User } = require('../models/user.js');

const getAccountForFileUpload = async (accountType, accountId) => {
  const mapAccountTypeToModel = {
    restaurant: { model: Restaurant, accountId: 'salesforceId', name: 'name' },
    contact: { model: User, accountId: 'householdId', name: 'username' },
  };
  const modelType = mapAccountTypeToModel[accountType];
  const entity = await modelType.model.findById(accountId);
  if (!entity) {
    throw new Error('No account to associate this file with');
  }
  return {
    name: entity[modelType.name],
    salesforceId: entity[modelType.accountId],
  };
};

module.exports = { getAccountForFileUpload };
