import axios from "axios";
import getSecrets from "../getSecrets";
import urls from "../urls";

interface GetTokenParams {
  refresh_token: string;
  client_id: string;
  client_secret: string;
  redirect_uri: "https%3A%2F%2Fsign.zoho.com";
  grant_type: "refresh_token";
}

export const getZohoToken = async () => {
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } =
    await getSecrets([
      "ZOHO_CLIENT_ID",
      "ZOHO_CLIENT_SECRET",
      "ZOHO_REFRESH_TOKEN",
    ]);

  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    throw Error("Zoho client id not found");
  }

  const params: GetTokenParams = {
    refresh_token: ZOHO_REFRESH_TOKEN,
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    redirect_uri: "https%3A%2F%2Fsign.zoho.com",
    grant_type: "refresh_token",
  };

  const { data } = await axios.post(urls.zohoToken, {}, { params });
  return data.access_token;
};
