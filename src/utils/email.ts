import sgMail from '@sendgrid/mail';

import getSecrets from './getSecrets';
import createDonationAckEmail from './emailTemplates/donationAck';
import createCampaignAckEmail from './emailTemplates/campaignAck';
import createHomeChefSignupEmail from './emailTemplates/homeChefSignup';
import createShiftEditEmail from './emailTemplates/shiftEdit';
import { activeCampaigns } from '../paypal/activeCampaigns';

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
    from: 'andy@ckoakland.org',
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
    from: 'andy@ckoakland.org',
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
