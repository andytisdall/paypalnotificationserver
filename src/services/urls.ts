const SFQueryPrefix = '/data/v56.0/query/?q=';
const SFOperationPrefix = '/data/v56.0/sobjects';

const prodUrls = {
  townFridgeCampaignId: '7018Z000003C3MxQAK',
  salesforce: 'https://communitykitchens.my.salesforce.com/services',
  // docusign: 'https://www.docusign.net/restapi',
  docusign: 'https://demo.docusign.net/restapi',
  docusignOauth: 'https://account.docusign.com',
  client: 'https://coherent-vision-368820.uw.r.appspot.com',
  server: 'https://coherent-vision-368820.uw.r.appspot.com',
  SFOperationPrefix,
  SFQueryPrefix,
};

const testUrls = {
  townFridgeCampaignId: '70179000000I0skAAC',
  salesforce:
    'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
  docusign: 'https://demo.docusign.net/restapi',
  docusignOauth: 'https://account-d.docusign.com',
  client: 'http://localhost:3000',
  server: 'http://localhost:3001',
  SFOperationPrefix,
  SFQueryPrefix,
};

export default process.env.NODE_ENV === 'production' ? prodUrls : testUrls;
