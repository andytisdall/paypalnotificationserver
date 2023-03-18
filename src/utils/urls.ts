const SFQueryPrefix = '/data/v56.0/query/?q=';
const SFOperationPrefix = '/data/v56.0/sobjects';
const fileBucket = 'coherent-vision-368820.appspot.com';

const prodUrls = {
  communityCourseCampaignId: '7018Z000003C7YEQA0',
  townFridgeCampaignId: '7018Z000003C3MxQAK',
  salesforce: 'https://communitykitchens.my.salesforce.com/services',
  docusign: 'https://www.docusign.net/restapi',
  docusignOauth: 'https://account.docusign.com',
  client: 'https://portal.ckoakland.org',
  server: 'https://portal.ckoakland.org',
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
};

const testUrls = {
  communityCourseCampaignId: '7018Z000003C7YEQA0',
  townFridgeCampaignId: '70175000000G1MDAA0',
  salesforce:
    'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
  docusign: 'https://demo.docusign.net/restapi',
  docusignOauth: 'https://account-d.docusign.com',
  client: 'http://localhost:3000',
  server: 'http://localhost:3001',
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
};

export default process.env.NODE_ENV === 'production' ? prodUrls : testUrls;
