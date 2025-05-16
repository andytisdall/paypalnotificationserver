import urls from "../../../urls";
import fetcher from "../../../fetcher";

export const deleteFiles = async (id: string, filesToDelete: string[]) => {
  // get all cdlinks tied to that account
  const CDLinkQuery = `SELECT ContentDocumentId from ContentDocumentLink WHERE LinkedEntityId = '${id}'`;

  const CDLinkQueryUri = urls.SFQueryPrefix + encodeURIComponent(CDLinkQuery);

  const CDLinkQueryResponse: {
    data: { records: { ContentDocumentId: string }[] };
  } = await fetcher.get(CDLinkQueryUri);
  // then get all content documents from the CDIds in the cdlinks
  if (!CDLinkQueryResponse.data.records) {
    throw Error("Failed querying for ContentDocumentLink");
  }

  const getPromises = CDLinkQueryResponse.data.records.map(
    async ({ ContentDocumentId }) => {
      const ContentDocUri =
        urls.SFOperationPrefix + "/ContentDocument/" + ContentDocumentId;
      const { data } = await fetcher.get(ContentDocUri);
      // then search those for the titles that we're replacing
      return data;
    }
  );
  const ContentDocs = await Promise.all(getPromises);

  const DocsToDelete = ContentDocs.filter((cd) => {
    return filesToDelete.includes(cd.Title);
  });
  // then delete those
  const deletePromises = DocsToDelete.map(async (cd) => {
    const ContentDocUri = urls.SFOperationPrefix + "/ContentDocument/" + cd.Id;
    await fetcher.delete(ContentDocUri);
  });
  await Promise.all(deletePromises);

  // content document links will be deleted automatically
};
