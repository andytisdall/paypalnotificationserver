const baseUrls = {
  SFQueryPrefix: '/data/v56.0/query/?q=',
  SFOperationPrefix: '/data/v56.0/sobjects',
  fileBucket: 'coherent-vision-368820.appspot.com',
  appleReviewerId: '64dab5b0c179cf7ef5e90ab4',
  apple: 'https://appleid.apple.com/auth/token',
  googleMaps: 'https://places.googleapis.com/v1/places',
  adminEmail: 'communitykitchens@ckoakland.org',
  ckKitchenAccountId: '0018Z0000362TqLQAU',
  townFridgeAccountId: '0018Z000037fa6cQAA',
  styleWeekCampaignId: '701UP00000ACmHeYAL',
  homeChefInPersonCampaignId: '701UP000008zJFdYAM',
  d4jCampaignId: '7018Z000003KpqIQAS',
  cocktailsCampaignId: '7018Z000003KptzQAC',
  corporateVolunteersCampaignId: '701UP000005bM5AYAU',
  townFridgeCampaignId: '7018Z000003C3Mx',
  ckKitchenCampaignId: '7018Z000002jtq0',
};

const prodUrls = {
  ...baseUrls,
  salesforce: 'https://communitykitchens.my.salesforce.com/services',
  salesforceMeal: 'https://communitykitchens.my.salesforce.com/services',
  docusign: 'https://na4.docusign.net/restapi',
  client: 'https://portal.ckoakland.org',
  server: 'https://portal.ckoakland.org',
};

const testUrls = {
  ...baseUrls,
  salesforce:
    'https://communitykitchens--ckhomechef.sandbox.my.salesforce.com/services',
  salesforceMeal:
    'https://communitykitchens--mealprog.sandbox.my.salesforce.com/services',
  docusign: 'https://demo.docusign.net/restapi',
  client: 'http://localhost:3000',
  server: 'http://localhost:3001',
  appleReviewerId: '64e69853db4b5043abcd55b6',
};

export default process.env.NODE_ENV === 'production' ? prodUrls : testUrls;
