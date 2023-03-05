"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SFQueryPrefix = '/data/v56.0/query/?q=';
var SFOperationPrefix = '/data/v56.0/sobjects';
var fileBucket = 'coherent-vision-368820.appspot.com';
var prodUrls = {
    communityCourseCampaignId: '7018Z000003C7YEQA0',
    townFridgeCampaignId: '7018Z000003C3MxQAK',
    salesforce: 'https://communitykitchens.my.salesforce.com/services',
    docusign: 'https://www.docusign.net/restapi',
    docusignOauth: 'https://account.docusign.com',
    client: 'https://portal.ckoakland.org',
    server: 'https://portal.ckoakland.org',
    SFOperationPrefix: SFOperationPrefix,
    SFQueryPrefix: SFQueryPrefix,
    fileBucket: fileBucket,
};
var testUrls = {
    communityCourseCampaignId: '7018Z000003C7YEQA0',
    townFridgeCampaignId: '70179000000I0skAAC',
    salesforce: 'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
    docusign: 'https://demo.docusign.net/restapi',
    docusignOauth: 'https://account-d.docusign.com',
    client: 'http://localhost:3000',
    server: 'http://localhost:3001',
    SFOperationPrefix: SFOperationPrefix,
    SFQueryPrefix: SFQueryPrefix,
    fileBucket: fileBucket,
};
exports.default = process.env.NODE_ENV === 'production' ? prodUrls : testUrls;
