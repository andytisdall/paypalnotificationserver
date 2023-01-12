const axios = require('axios');

const urls = require('./urls');
const getSecrets = require('./getSecrets');

module.exports = async () => {
  const secrets = await getSecrets(['SF_CLIENT_ID', 'SF_CLIENT_SECRET']);

  const SALESFORCE_AUTH_CREDENTIALS = {
    client_id: secrets.SF_CLIENT_ID,
    client_secret: secrets.SF_CLIENT_SECRET,
    grant_type: 'client_credentials',
  };

  const SFAuthPost = new URLSearchParams();
  for (field in SALESFORCE_AUTH_CREDENTIALS) {
    SFAuthPost.append(field, SALESFORCE_AUTH_CREDENTIALS[field]);
  }

  const SF_AUTH_URI = `${urls.salesforce}/oauth2/token`;

  const SFResponse = await axios.post(SF_AUTH_URI, SFAuthPost, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return SFResponse.data.access_token;
};
