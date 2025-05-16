import FormData from "form-data";
import path from "path";
import { FileArray } from "express-fileupload";

import urls from "../../../urls";
import fetcher from "../../../fetcher";
import { fileInfo, FileWithMetadata, FileMetadata, Doc } from "./metadata";
import { UnformattedContact } from "../contact";

export const formatFilesFromFileArray = (files: FileArray) => {
  const fileList: FileWithMetadata[] = [];
  for (let entry in files) {
    if (!Array.isArray(files[entry])) {
      if (Object.keys(fileInfo).includes(entry)) {
        fileList.push({ docType: entry as Doc, file: files[entry] });
      }
    }
  }

  if (!fileList.length) {
    throw Error("Improper format for file upload");
  }

  return fileList;
};

export const uploadFileToSalesforce = async (
  contact: UnformattedContact,
  file: FileWithMetadata
) => {
  await fetcher.setService("salesforce");
  const typeOfFile = fileInfo[file.docType];
  const title = formatFilename(typeOfFile, contact.LastName);

  const fileMetaData = {
    Title: title,
    Description: typeOfFile.description,
    PathOnClient:
      file.file.name + "/" + typeOfFile.folder + path.extname(file.file.name),
  };

  const postBody = new FormData();
  postBody.append("entity_document", JSON.stringify(fileMetaData), {
    contentType: "application/json",
  });

  postBody.append("VersionData", file.file.data, { filename: file.file.name });

  let res = await fetcher.post(
    urls.SFOperationPrefix + "/ContentVersion/",
    postBody,
    {
      headers: postBody.getHeaders(),
    }
  );
  const contentVersionId = res.data.id;

  const ContentDocumentId = await getDocumentId(contentVersionId);

  const CDLinkData = {
    ShareType: "I",
    LinkedEntityId: contact.Id,
    ContentDocumentId,
  };

  await fetcher.post(
    urls.SFOperationPrefix + "/ContentDocumentLink/",
    CDLinkData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const formatFilename = (file: FileMetadata, lastName: string) => {
  const format = (string: string) => string.replace(/ /g, "_").toUpperCase();
  return format(file.title) + "_" + format(lastName);
};

const getDocumentId = async (CVId: string): Promise<string> => {
  const documentQuery = [
    "SELECT",
    "ContentDocumentId",
    "from",
    "ContentVersion",
    "WHERE",
    "Id",
    "=",
    `'${CVId}'`,
  ];

  const documentQueryUri = urls.SFQueryPrefix + documentQuery.join("+");

  const documentQueryResponse = await fetcher.get(documentQueryUri);
  return documentQueryResponse.data.records[0].ContentDocumentId;
};
