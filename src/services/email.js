const sgMail = require('@sendgrid/mail');

const getSecrets = require('./getSecrets');
const createEmail = require('./emailTemplate');

const initializeEmail = async () => {
  const secrets = await getSecrets(['SENDGRID_KEY']);
  sgMail.setApiKey(secrets.SENDGRID_KEY);
};

const sendEmail = async (donationData) => {
  await initializeEmail();
  const html = createEmail(donationData.firstName, donationData.payment_gross);

  const msg = {
    to: donationData.email,
    from: 'andy@ckoakland.org',
    subject: 'Thank you for your donation!',
    html,
  };
  try {
    await sgMail.send(msg);
    console.log('Email sent to ' + donationData.email);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendEmail };
