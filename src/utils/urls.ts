const SFQueryPrefix = '/data/v56.0/query/?q=';
const SFOperationPrefix = '/data/v56.0/sobjects';
const fileBucket = 'coherent-vision-368820.appspot.com';

const prodUrls = {
  communityCourseCampaignId: '7018Z000003C7YE',
  eventCampaignId: '7018Z0000026vaI',
  townFridgeCampaignId: '7018Z000003C3Mx',
  salesforce: 'https://communitykitchens.my.salesforce.com/services',
  salesforceMeal: 'https://communitykitchens.my.salesforce.com/services',
  docusign: 'https://na4.docusign.net/restapi',
  client: 'https://portal.ckoakland.org',
  server: 'https://portal.ckoakland.org',
  google: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=',
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
};

const testUrls = {
  communityCourseCampaignId: '7018Z000003C7YE',
  eventCampaignId: '70179000000FIX9',
  townFridgeCampaignId: '70179000000FFL3',
  salesforce:
    'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
  salesforceMeal:
    'https://communitykitchens--mealprog.sandbox.my.salesforce.com/services',
  docusign: 'https://demo.docusign.net/restapi',
  client: 'http://localhost:3000',
  server: 'http://localhost:3001',
  google: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=',
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
};

export default process.env.NODE_ENV === 'production' ? prodUrls : testUrls;
