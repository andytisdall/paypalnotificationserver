import fetcher from '../fetcher';
import urls from '../urls';

const getSigningUrl = async ({ agreementId }: { agreementId: string }) => {
  await fetcher.setService('acrobat');

  const response = await fetcher.get(
    urls.acrobat + '/agreements/' + agreementId
  );

  const participantId = response.data.participantSetsInfo[0].memberInfos[0].id;

  const { data } = await fetcher.post(
    urls.acrobat + '/agreements/' + agreementId + '/deliverableAccess',
    {
      accessType: 'URL',
      participantAccessInfos: [
        { participantId, accessOption: ['REVIEW_AND_SIGN'] },
      ],
    }
  );
  const signingUrl: string =
    data.accessInfoList[0].accessInfos[0].urlDetails[0].url;

  return signingUrl;
};

export default getSigningUrl;
