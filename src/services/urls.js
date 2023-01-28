const SFQueryPrefix = '/data/v56.0/query/?q=';
const SFOperationPrefix = '/data/v56.0/sobjects';

const prodUrls = {
  salesforce: 'https://communitykitchens.my.salesforce.com/services',
  docusign: 'https://www.docusign.net/restapi',
  docusignOauth: 'https://account.docusign.com',
  client: 'https://coherent-vision-368820.uw.r.appspot.com',
  server: 'https://coherent-vision-368820.uw.r.appspot.com',
  SFOperationPrefix,
  SFQueryPrefix,
};

const testUrls = {
  salesforce:
    'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
  docusign: 'https://demo.docusign.net/restapi',
  docusignOauth: 'https://account-d.docusign.com',
  client: 'http://localhost:3000',
  server: 'http://localhost:3001',
  SFOperationPrefix,
  SFQueryPrefix,
};

module.exports = process.env.NODE_ENV === 'production' ? prodUrls : testUrls;
