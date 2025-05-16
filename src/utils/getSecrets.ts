import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

interface Secrets {
  SF_CLIENT_ID: string;
  SF_CLIENT_SECRET: string;
  TWILIO_ID: string;
  TWILIO_AUTH_TOKEN?: string;
  MESSAGING_SERVICE_SID: string;
  JWT_KEY: string;
  MONGO_PASSWORD: string;
  SENDGRID_KEY: string;
  GOOGLE_CLIENT_ID: string;
  D4J_CHECK_IN_KEY: string;
  APNS_P8: string;
  APNS_KEY_ID: string;
  APNS_TEAM_ID: string;
  D4J_FCM_API_KEY: string;
  HC_FCM_API_KEY: string;
  GOOGLE_MAPS_API_KEY: string;
  DOCMADEEASY_KEY: string;
  CK_API_KEY: string;
  APPLE_TEAM_ID: string;
  APPLE_KID: string;
  APPLE_AUTH_KEY: string;
  API_NINJA_KEY: string;
}

type Secret = keyof Secrets;

const getSecrets: (nameList: Secret[]) => Promise<Partial<Secrets>> = async (
  nameList
) => {
  if (process.env.NODE_ENV !== "production") {
    const keys: any = await import("../../keys");
    return keys as Secrets;
  }
  const secrets: Partial<Secrets> = {};
  const secretClient = new SecretManagerServiceClient();

  const getSecret = async (name: Secret) => {
    const [version] = await secretClient.accessSecretVersion({
      name: `projects/385802469502/secrets/${name}/versions/latest`,
    });
    return version.payload?.data?.toString();
  };

  for (let secretName of nameList) {
    const token = await getSecret(secretName);
    secrets[secretName] = token;
  }

  return secrets;
};

export default getSecrets;
