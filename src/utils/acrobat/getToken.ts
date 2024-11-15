import axios from 'axios';

import getSecrets from '../getSecrets';

const getAcrobatToken = async () => {
  const { ACROBAT_CLIENT_ID, ACROBAT_CLIENT_SECRET } = await getSecrets([
    'ACROBAT_CLIENT_ID',
    'ACROBAT_CLIENT_SECRET',
  ]);
  const params = {
    redirect_uri: 'https://your-oAuthInteraction-Server/your-oAuth-Page.html',
    response_type: 'code',
    client_id: ACROBAT_CLIENT_ID,
    state: {},
    scope:
      'user_read:account+user_write:account+user_login:account+agreement_read:account+agreement_write:account+agreement_send:account',
  };

  const { data }: { data: { code?: string } } = await axios.get(
    'https://secure.echosign.com/public/oauth',
    {
      params,
    }
  );
  if (!data.code) {
    console.log(data);
    throw Error('Failed to get Acrobat OAuth code');
  }

  const tokenUri = 'api.na1.adobesign.com/oauth/v2/token';
  const postBody = {
    grant_type: 'authorization_code',
    code: data.code,
    client_id: ACROBAT_CLIENT_ID,
    client_secret: ACROBAT_CLIENT_SECRET,
    redirect_uri: 'https://portal.ckoakland.org',
  };
  const {
    data: { access_token },
  }: { data: { access_token?: string } } = await axios.post(
    tokenUri,
    postBody,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!access_token) {
    throw Error('Failed to get Acrobat access token');
  }

  return access_token;
};

export default getAcrobatToken;
