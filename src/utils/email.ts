import sgMail from '@sendgrid/mail';

import getSecrets from './getSecrets';
import createDonationAckEmail from './emailTemplates/donationAck';
import createCampaignAckEmail from './emailTemplates/campaignAck';
import createHomeChefSignupEmail from './emailTemplates/homeChefSignup';
import createShiftEditEmail from './emailTemplates/shiftEdit';
import createForgotPasswordEmail from './emailTemplates/forgotPassword';
import createKitchenShiftCancelEmail from './emailTemplates/kitchenShiftCancel';
import createEventShiftCancelEmail from './emailTemplates/eventShiftCancel';
import { D4JContact } from './salesforce/SFQuery/contact';
import createPrizeRequestEmail from './emailTemplates/prizeRequest';
import urls from './urls';

export const initializeEmail = async () => {
  const { SENDGRID_KEY } = await getSecrets(['SENDGRID_KEY']);
  if (!SENDGRID_KEY) {
    throw new Error('Could not find sendgrid key to initialize email');
  }
  sgMail.setApiKey(SENDGRID_KEY);
};

export const sendEmailToSelf = async ({
  subject,
  message,
}: {
  subject: string;
  message: string;
}) => {
  const msg = {
    to: 'andy@ckoakland.org',
    from: urls.adminEmail,
    subject,
    text: 'Sent to self from server: ' + message,
  };

  await sendEmail(msg);
};

export const sendDonationAckEmail = async (donationData: {
  first_name: string;
  last_name: string;
  payment_gross: string;
  payer_email: string;
  custom?: string;
}) => {
  let html;
  if (donationData.custom) {
    html = createCampaignAckEmail(
      donationData.first_name,
      donationData.last_name,
      donationData.payment_gross
    );
  } else {
    html = createDonationAckEmail(
      donationData.first_name,
      donationData.last_name,
      donationData.payment_gross
    );
  }

  const msg = {
    to: donationData.payer_email,
    from: urls.adminEmail,
    subject: 'Thank you for your donation!',
    html,
  };

  await sendEmail(msg);
};

export const sendHomeChefSignupEmail = async (chef: {
  firstName: string;
  email: string;
}) => {
  const html = createHomeChefSignupEmail(chef);

  const msg = {
    to: chef.email,
    from: 'mollye@ckoakland.org',
    subject: 'Thank you for signing up as a CK Home Chef!',
    html,
  };

  await sendEmail(msg);
};

export const sendForgotPasswordEmail = async (
  email: string,
  link: string,
  username: string
) => {
  const html = createForgotPasswordEmail(link, username);

  const msg = {
    to: email,
    from: urls.adminEmail,
    subject: 'CK Portal: Your link to create a new password',
    html,
  };

  await sendEmail(msg);
};

export const sendShiftEditEmail = async (
  email: string,
  shift: { date: string; cancel: boolean; mealCount: number; fridge: string }
) => {
  const html = createShiftEditEmail(shift);

  const action = shift.cancel ? 'canceled' : 'edited';

  const msg = {
    to: email,
    from: 'mollye@ckoakland.org',
    subject: `You have ${action} a home chef shift`,
    html,
  };

  await sendEmail(msg);
};

export const sendKitchenShiftCancelEmail = async (
  email: string,
  shiftData: { date: string; name?: string }
) => {
  const html = createKitchenShiftCancelEmail(shiftData);

  const msg = {
    to: email,
    from: 'mollye@ckoakland.org',
    subject: `You have canceled a CK Kitchen volunteer shift`,
    html,
  };

  await sendEmail(msg);
};

export const sendEventShiftCancelEmail = async (
  email: string,
  shiftData: { date: string; name?: string; event: string }
) => {
  const html = createEventShiftCancelEmail(shiftData);

  const msg = {
    to: email,
    from: 'mollye@ckoakland.org',
    subject: `You have canceled a CK event volunteer shift`,
    html,
  };

  await sendEmail(msg);
};

export const sendPrizeRequestEmail = async (
  contact: D4JContact,
  prize: string,
  restaurantName?: string
) => {
  const html = createPrizeRequestEmail(contact, prize, restaurantName);

  const msg = {
    to: 'andy@ckoakland.org',
    from: '',
    subject: 'D4J Rewards Request',
    html,
  };

  await sendEmail(msg);
};

interface EmailMetaData {
  to: string | string[];
  from: string;
  subject: string;
  mediaUrl?: string[];
}

interface EmailWithText extends EmailMetaData {
  text: string;
}

interface EmailWithHTML extends EmailMetaData {
  html: string;
}

export type EmailMessage =
  | EmailWithHTML
  | EmailWithText
  | (EmailWithHTML & EmailWithText);

export const sendEmail = async (msg: EmailMessage) => {
  await initializeEmail();
  await sgMail.send(msg);
  console.log('Email sent to ' + msg.to);
};
