const axios = require('axios');

const { Restaurant } = require('../models/restaurant.js');
const { User } = require('../models/user.js');
const urls = require('../services/urls');
const getSFToken = require('../services/salesforce/getSFToken');

const axiosInstance = axios.create({
  baseURL: urls.salesforce,
});

const getAccountForFileUpload = async (accountType, accountId) => {
  if (accountType === 'restaurant') {
    const restaurant = await Restaurant.findById(accountId);
    return restaurant;
  }
  if (accountType === 'contact') {
    const user = await User.findById(accountId);

    const token = await getSFToken();
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
    const { data } = await axiosInstance.get(
      urls.SFOperationPrefix + '/Contact/' + user.salesforceId
    );
    return {
      name: data.LastName,
      salesforceId: data.npsp__HHId__c,
    };
  }
};

module.exports = { getAccountForFileUpload };
