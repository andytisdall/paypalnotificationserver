const sgMail = require('@sendgrid/mail');

const getSecrets = require('./getSecrets');
const createEmail = require('./emailTemplate');

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

  try {
    await sgMail.send(msg);
    console.log('Email sent to ' + donationData.payer_email);
  } catch (err) {
    console.log(err);
  }
}

const sendEmail = async (donationData) => {
  await initializeEmail();
  const html = createEmail(
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

  try {
    await sgMail.send(msg);
    console.log('Email sent to ' + donationData.payer_email);
  } catch (err) {
    console.log(err);
  }
};

// sendEmail({ payer_email: 'andrew.tisdall@gmail.com', firstName: 'Gogo', payment_gross: '50.78'})

module.exports = { sendEmail, sendEmailToSelf };
