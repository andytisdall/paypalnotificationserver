import fetcher from '../fetcher';
import urls from '../urls';

const uploadDoc = async (agreementId: string) => {
  await fetcher.setService('acrobat');
  const { data } = await fetcher.get(
    urls.acrobat + '/agreements/' + agreementId + '/combinedDocument/url'
  );
  return data.url;
};

export default uploadDoc;
