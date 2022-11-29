const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

module.exports = async (nameList) => {
  const secrets = {};
  const secretClient = new SecretManagerServiceClient();
  // error if not in cloud env
  try {
    const projectId = await secretClient.getProjectId();
    if (projectId) {
      const getSecret = async (name) => {
        const [version] = await secretClient.accessSecretVersion({
          name: `projects/385802469502/secrets/${name}/versions/latest`,
        });
        return version.payload.data.toString();
      };
      for (secretName of nameList) {
        secrets[secretName] = await getSecret(secretName);
      }
    } else {
      throw Error();
    }
  } catch {
    for (secretName of nameList) {
      secrets[secretName] = require('../keys')[secretName];
    }
  }
  return secrets;
};
