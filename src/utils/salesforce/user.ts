import fetcher from "../fetcher";
import urls from "../urls";

export const getPermissionSets = async () => {
  await fetcher.setService("salesforce");
  const query = `SELECT FIELDS(ALL) from PermissionSet WHERE PermissionsForceTwoFactor = TRUE LIMIT 200`;
  const { data } = await fetcher.get(
    urls.SFQueryPrefix + encodeURIComponent(query),
  );
  return data.records;
};

export const updateSalesforcePermissions = async (permissionSetId: string) => {
  await fetcher.setService("salesforce");
  // if the api only thing gets turned on by accident, use this to turn it off so you can access the ui
  const uri = urls.SFOperationPrefix + "/PermissionSet/" + permissionSetId;
  // 0PS8Z000000zdnmWAA

  const patchBody = {
    // PermissionsApiUserOnly: false,
    PermissionsForceTwoFactor: false,
  };
  const result = await fetcher.patch(uri, patchBody);
  return result.data;
};
