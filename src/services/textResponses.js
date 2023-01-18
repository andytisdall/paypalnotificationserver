const regionKey = {
  EAST_OAKLAND: 'East Oakland',
  WEST_OAKLAND: 'West Oakland',
};

const SIGN_UP_WORDS = ['signup', 'enroll', 'start', 'unstop', 'yes'];
const CANCEL_WORDS = [
  'stop',
  'stopall',
  'unsubscribe',
  'quit',
  'cancel',
  'end',
];
const INFO_WORD = 'info';
const SURVEY_URL = 'example url';

const signUpResponse = (region) => {
  return `Thank you for signing up for ${regionKey[region]} meal notifications!`;
};

const duplicateResponse = (region) => {
  return `Your phone number is already on the list for ${regionKey[region]} meal notifications.`;
};

const feedbackResponse = () => {
  return `Thank you for your feedback. A team member will review your message soon. If you want to fill out a survey about your experience with Community Kitchens, please follow this link: ${SURVEY_URL}`;
};

const generalInfoResponse = (region) => {
  return `This is the Community Kitchens text service for ${regionKey[region]} meal notifications. Send the word "${SIGN_UP_WORDS[0]}" to sign up for alerts. Send the word "${CANCEL_WORDS[0]}" to stop receiving texts from this number.`;
};

module.exports = {
  SIGN_UP_WORDS,
  CANCEL_WORDS,
  INFO_WORD,
  signUpResponse,
  duplicateResponse,
  feedbackResponse,
  generalInfoResponse,
};
