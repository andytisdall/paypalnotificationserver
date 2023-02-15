import axios from 'axios';

import urls from '../urls';
import getSecrets from '../getSecrets';

export default async () => {
  const { SF_CLIENT_ID, SF_CLIENT_SECRET } = await getSecrets([
    'SF_CLIENT_ID',
    'SF_CLIENT_SECRET',
  ]);

  if (!SF_CLIENT_ID || !SF_CLIENT_SECRET) {
    throw new Error('Could not find salesforce auth credentials');
  }

  const SFAuthPost = new URLSearchParams();

  SFAuthPost.append('client_id', SF_CLIENT_ID);
  SFAuthPost.append('client_secret', SF_CLIENT_SECRET);
  SFAuthPost.append('grant_type', 'client_credentials');

  const SF_AUTH_URI = `${urls.salesforce}/oauth2/token`;

  const SFResponse = await axios.post(SF_AUTH_URI, SFAuthPost, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return SFResponse.data.access_token;
};
