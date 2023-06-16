// import fetcher from '../fetcher';
import axios from 'axios';
import urls from '../urls';
import getSecrets from '../getSecrets';

export default async (sandbox: string | null = null) => {
  let id, secret, url;

  if (sandbox === 'meal') {
    const { SF_MP_ID, SF_MP_SECRET } = await getSecrets([
      'SF_MP_ID',
      'SF_MP_SECRET',
    ]);
    id = SF_MP_ID;
    secret = SF_MP_SECRET;
    url = urls.salesforceMeal;
  } else {
    const { SF_CLIENT_ID, SF_CLIENT_SECRET } = await getSecrets([
      'SF_CLIENT_ID',
      'SF_CLIENT_SECRET',
    ]);
    id = SF_CLIENT_ID;
    secret = SF_CLIENT_SECRET;
    url = urls.salesforce;
  }

  if (!id || !secret) {
    throw new Error('Could not find salesforce auth credentials');
  }

  // fetcher.clearService();

  const SFAuthPost = new URLSearchParams();

  SFAuthPost.append('client_id', id);
  SFAuthPost.append('client_secret', secret);
  SFAuthPost.append('grant_type', 'client_credentials');

  const SF_AUTH_URI = `${url}/oauth2/token`;

  const SFResponse = await axios.post(SF_AUTH_URI, SFAuthPost, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!SFResponse.data.access_token) {
    throw Error('Did not get token from salesforce');
  }

  return SFResponse.data.access_token;
};
