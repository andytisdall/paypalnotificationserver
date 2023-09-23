import fetcher from '../../fetcher';
import urls from '../../urls';

export const getUsers = async () => {
  await fetcher.setService('salesforce');
  // const query = `SELECT Name, Id, PermissionApi from PermissionSet`;
  // if the apui only thing gets turned on by accident, use this to turn it off so you can access the ui
  const userQueryUri =
    urls.SFOperationPrefix + '/PermissionSet/0PS8Z000000zdnmWAA';
  const result = await fetcher.patch(userQueryUri, {
    PermissionsApiUserOnly: false,
  });
  return result.data;
};
