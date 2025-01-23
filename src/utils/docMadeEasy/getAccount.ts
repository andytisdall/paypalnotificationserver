import axios from 'axios';

import urls from '../urls';
import getSecrets from '../getSecrets';

const getAccount = async () => {
  const { DOCMADEEASY_KEY } = await getSecrets(['DOCMADEEASY_KEY']);

  const requestUrl = urls.docMadeEasy + '/account' + '?akey=' + DOCMADEEASY_KEY;

  const { data }: { data: { apiSigns: number } } = await axios.get(requestUrl);

  return data;
};

export default getAccount;
