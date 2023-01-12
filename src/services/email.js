const sgMail = require('@sendgrid/mail');

const getSecrets = require('./getSecrets');
const createDonationAckEmail = require('./emailTemplates/donationAck');
const createHomeChefSignupEmail = require('./emailTemplates/homeChefSignup');

const initializeEmail = async () => {
  const secrets = await getSecrets(['SENDGRID_KEY']);
  sgMail.setApiKey(secrets.SENDGRID_KEY);
};

const sendEmailToSelf = async ({ subject, message }) => {
  await initializeEmail();
  const msg = {
    to: 'andy@ckoakland.org',
    from: 'andy@ckoakland.org',
    subject,
    text: 'Sent to self from server: ' + message,
  };

  await sendEmail(msg);
};

const sendDonationAckEmail = async (donationData) => {
  await initializeEmail();
  const html = createDonationAckEmail(
    donationData.first_name,
    donationData.last_name,
    donationData.payment_gross
  );

  const msg = {
    to: donationData.payer_email,
    from: 'andy@ckoakland.org',
    subject: 'Thank you for your donation!',
    html,
  };

  await sendEmail(msg);
};

const sendHomeChefSignupEmail = async (chef) => {
  const html = createHomeChefSignupEmail(chef);

  const msg = {
    to: chef.email,
    from: 'andy@ckoakland.org',
    subject: 'Thank you for signing up as a CK Home Chef!',
    html,
  };

  await sendEmail(msg);
};

const sendEmail = async (msg) => {
  await sgMail.send(msg);
  console.log('Email sent to ' + msg.to);
};

module.exports = {
  sendEmail,
  sendEmailToSelf,
  sendDonationAckEmail,
  sendHomeChefSignupEmail,
};
