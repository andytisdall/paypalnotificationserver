const prodUrls = {
  salesforce: 'https://communitykitchens.my.salesforce.com/services',
  docusign: 'https://demo.docusign.net/restapi',
  docusignOauth: 'account-d.docusign.com',
  self: 'https://coherent-vision-368820.uw.r.appspot.com/',
};

const testUrls = {
  salesforce:
    'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
  docusign: 'https://demo.docusign.net/restapi',
  docusignOauth: 'account-d.docusign.com',
  self: 'http://localhost:3000/',
};

module.exports = process.env.NODE_ENV === 'production' ? prodUrls : testUrls;
