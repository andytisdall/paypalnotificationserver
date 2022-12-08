const nodemailer = require('nodemailer');
let aws = require('aws-sdk');

const getSecrets = require('../services/getSecrets');
const createEmail = require('../services/emailTemplate');

const configureAWS = async () => {
  const secrets = await getSecrets(['AWS_ACCESS_KEY', 'AWS_SECRET']);

  aws.config.update({
    accessKeyId: secrets.AWS_ACCESS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: 'us-west-1',
  });

  const transporter = nodemailer.createTransport({
    SES: new aws.SES({ region: 'us-west-1', apiVersion: '2012-10-17' }),
  });

  return (donationData) => {
    const html = createEmail(
      donationData.firstName,
      donationData.payment_gross
    );

    return transporter.sendMail({
      from: 'andy@ckoakland.org',
      to: donationData.email,
      subject: 'Thank you for your donation!',
      html,
    });
  };
};

module.exports = configureAWS;
