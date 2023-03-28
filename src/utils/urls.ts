const SFQueryPrefix = '/data/v56.0/query/?q=';
const SFOperationPrefix = '/data/v56.0/sobjects';
const fileBucket = 'coherent-vision-368820.appspot.com';

const prodUrls = {
  communityCourseCampaignId: '7018Z000003C7YEQA0',
  townFridgeCampaignId: '7018Z000003C3MxQAK',
  salesforce: 'https://communitykitchens.my.salesforce.com/services',
  docusign: 'https://na4.docusign.net/restapi',
  docusignOauth: 'https://account.docusign.com',
  client: 'https://portal.ckoakland.org',
  server: 'https://portal.ckoakland.org',
  google: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=',
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
};

const testUrls = {
  communityCourseCampaignId: '7018Z000003C7YEQA0',
  townFridgeCampaignId: '7018B000000LnmmQAC',
  salesforce:
    'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
  docusign: 'https://na4.docusign.net/restapi',
  docusignOauth: 'https://account.docusign.com',
  client: 'https://ck-test-portal.wl.r.appspot.com/',
  server: 'https://ck-test-portal.wl.r.appspot.com/',
  google: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=',
  SFOperationPrefix,
  SFQueryPrefix,
  fileBucket,
};

export default testUrls;
