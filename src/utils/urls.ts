const SFQueryPrefix = '/data/v56.0/query/?q=';
const SFOperationPrefix = '/data/v56.0/sobjects';
const fileBucket = 'coherent-vision-368820.appspot.com';
const appleReviewerId = '64dab5b0c179cf7ef5e90ab4';
const apple = 'https://appleid.apple.com/auth/token';
const googleMaps = 'https://places.googleapis.com/v1/places';
const adminEmail = 'communitykitchens@ckoakland.org';

const prodUrls = {
  cocktailsCampaignId: '7018Z000003KptzQAC',
  orwCampaignId: '701UP0000035lFuYAI',
  townFridgeCampaignId: '7018Z000003C3Mx',
  salesforce: 'https://communitykitchens.my.salesforce.com/services',
  salesforceMeal: 'https://communitykitchens.my.salesforce.com/services',
  docusign: 'https://na4.docusign.net/restapi',
  client: 'https://portal.ckoakland.org',
  server: 'https://portal.ckoakland.org',
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
  apple,
  googleMaps,
  appleReviewerId,
  ckKitchenCampaignId: '7018Z000002jtq0',
  reggaeCassouletEventId: '7018Z000003Ko3HQAS',
  adminEmail,
};

const testUrls = {
  cocktailsCampaignId: '701VF000003nkA3YAI',
  townFridgeCampaignId: '70174000000Yqjh',
  salesforce:
    'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
  salesforceMeal:
    'https://communitykitchens--mealprog.sandbox.my.salesforce.com/services',
  docusign: 'https://demo.docusign.net/restapi',
  client: 'http://localhost:3000',
  server: 'http://localhost:3001',
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
  apple,
  googleMaps,
  appleReviewerId: '64e69853db4b5043abcd55b6',
  ckKitchenCampaignId: '70174000000YqmC',
  reggaeCassouletEventId: '70174000000YrEu',
  adminEmail,
};

export default process.env.NODE_ENV === 'production' ? prodUrls : testUrls;
