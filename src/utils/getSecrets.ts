import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import keys from '../../keys';

interface secrets extends Record<string, string | undefined> {
  SF_CLIENT_ID?: string;
  SF_CLIENT_SECRET?: string;
  TWILIO_ID?: string;
  TWILIO_AUTH_TOKEN?: string;
  JWT_KEY?: string;
  MONGO_PASSWORD?: string;
  SENDGRID_KEY?: string;
  DOCUSIGN_USER_ID?: string;
  DOCUSIGN_ID?: string;
  DOCUSIGN_SECRET?: string;
  DOCUSIGN_ACCOUNT_ID?: string;
  TWILIO_RECOVERY_CODE?: string;
  DOCUSIGN_PRIVATE_KEY?: string;
}

export default async (nameList: string[]) => {
  if (process.env.NODE_ENV !== 'production') {
    return keys;
  }
  const secrets: secrets = {};
  const secretClient = new SecretManagerServiceClient();

  const getSecret = async (name: string) => {
    const [version] = await secretClient.accessSecretVersion({
      name: `projects/385802469502/secrets/${name}/versions/latest`,
    });
    return version.payload?.data?.toString();
  };

  for (let secretName of nameList) {
    secrets[secretName] = await getSecret(secretName);
  }

  return secrets;
};
