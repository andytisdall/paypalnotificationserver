import axios from "axios";
import urls from "../urls";

import getSecrets from "../getSecrets";

export default async () => {
  const { SF_CLIENT_ID, SF_CLIENT_SECRET } = await getSecrets([
    "SF_CLIENT_ID",
    "SF_CLIENT_SECRET",
  ]);

  if (!SF_CLIENT_ID || !SF_CLIENT_SECRET) {
    throw new Error("Could not find salesforce auth credentials");
  }

  const SFAuthPostBody = new URLSearchParams();
  SFAuthPostBody.append("client_id", SF_CLIENT_ID);
  SFAuthPostBody.append("client_secret", SF_CLIENT_SECRET);
  SFAuthPostBody.append("grant_type", "client_credentials");

  const SFResponse = await axios.post(
    urls.salesforce + "/oauth2/token",
    SFAuthPostBody,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  if (!SFResponse.data.access_token) {
    throw Error("Could not get token from salesforce");
  }

  return SFResponse.data.access_token;
};
