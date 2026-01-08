import urls from "../../../urls";
import fetcher from "../../../fetcher";

export const getFilesForCampaign = async (campaignId: string) => {
  // get all cdlinks tied to that account
  const CDLinkQuery = `SELECT ContentDocumentId from ContentDocumentLink WHERE LinkedEntityId = '${campaignId}'`;

  const CDLinkQueryUri = urls.SFQueryPrefix + encodeURIComponent(CDLinkQuery);

  const CDLinkQueryResponse: {
    data: { records: { ContentDocumentId: string }[] };
  } = await fetcher.get(CDLinkQueryUri);
  // then get all content documents from the CDIds in the cdlinks
  if (!CDLinkQueryResponse.data.records) {
    throw Error("Failed querying for ContentDocumentLink");
  }

  const publicURLQuery = `SELECT DistributionPublicUrl FROM ContentDistribution WHERE ContentDocumentId IN ('${CDLinkQueryResponse.data.records
    .map(({ ContentDocumentId }) => ContentDocumentId)
    .join("','")}')`;

  const publicURLQueryUri =
    urls.SFQueryPrefix + encodeURIComponent(publicURLQuery);

  const publicURLQueryResponse: {
    data: { records: { DistributionPublicUrl: string }[] };
  } = await fetcher.get(publicURLQueryUri);

  const photos = publicURLQueryResponse.data.records;

  console.log(photos);
};
