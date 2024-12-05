import getSecrets from '../getSecrets';

const getAcrobatToken = async () => {
  const { ADOBE_INTEGRATION_KEY } = await getSecrets(['ADOBE_INTEGRATION_KEY']);

  if (!ADOBE_INTEGRATION_KEY) {
    throw Error('Failed to get Acrobat access token');
  }

  return ADOBE_INTEGRATION_KEY;
};

export default getAcrobatToken;
