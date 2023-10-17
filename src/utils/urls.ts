const SFQueryPrefix = '/data/v56.0/query/?q=';
const SFOperationPrefix = '/data/v56.0/sobjects';
const fileBucket = 'coherent-vision-368820.appspot.com';
const appleReviewerId = '64dab5b0c179cf7ef5e90ab4';
const apple = 'https://appleid.apple.com/auth/token';
const google = 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=';

const prodUrls = {
  townFridgeCampaignId: '7018Z000003C3Mx',
  salesforce: 'https://communitykitchens.my.salesforce.com/services',
  salesforceMeal: 'https://communitykitchens.my.salesforce.com/services',
  docusign: 'https://na4.docusign.net/restapi',
  client: 'https://portal.ckoakland.org',
  server: 'https://portal.ckoakland.org',
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
  activeCampaigns: [],
  apple,
  google,
  appleReviewerId,
  ckKitchenCampaignId: '7018Z000002jtq0QAA',
};

const testUrls = {
  townFridgeCampaignId: '70179000000FFL3',
  salesforce:
    'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
  salesforceMeal:
    'https://communitykitchens--mealprog.sandbox.my.salesforce.com/services',
  docusign: 'https://demo.docusign.net/restapi',
  client: 'http://localhost:3000',
  server: 'http://localhost:3001',
  google,
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
  activeCampaigns: ['70179000000FIX9'],
  apple,
  appleReviewerId: '64e69853db4b5043abcd55b6',
  ckKitchenCampaignId: '70179000000FaEG',
};

export default process.env.NODE_ENV === 'production' ? prodUrls : testUrls;
