import urls from "../utils/urls";

// const formatPhone = (phone: string) => {
//   return phone.substring(2);
// };

interface regions extends Record<string, string> {
  EAST_OAKLAND: string;
  WEST_OAKLAND: string;
}

export const regionKey: regions = {
  EAST_OAKLAND: "East Oakland",
  WEST_OAKLAND: "West Oakland",
};

const SIGN_UP_WORDS = ["signup", "enroll", "start", "unstop", "yes"];
const CANCEL_WORDS = [
  "stop",
  "stopall",
  "unsubscribe",
  "quit",
  "cancel",
  "end",
];
const INFO_WORD = "info";
const MEAL_SURVEY_URL = urls.client + "/forms/meal-survey";

const signUpResponse = (region: string) => {
  return `Thank you for signing up for ${regionKey[region]} meal notifications! For help, reply "help". To opt-out, reply "stop". If you are able to complete our short survey, we won't share your data and it helps greatly with funding to provide free meals to the people: ${MEAL_SURVEY_URL}`;
};

const duplicateResponse = (region: string) => {
  return `Your phone number is already on the list for ${regionKey[region]} meal notifications.`;
};

const feedbackResponse = () => {
  return `Thank you for your feedback. A team member will review your message soon. If you are able to complete our short survey, we won't share your data and it helps greatly with funding to provide free meals to the people: ${MEAL_SURVEY_URL}`;
};

const generalInfoResponse = (region: string) => {
  return `This is the Community Kitchens text service for ${regionKey[region]} meal notifications. Send the word "${SIGN_UP_WORDS[0]}" to sign up for alerts. Send the word "${CANCEL_WORDS[0]}" to stop receiving texts from this number.`;
};

const dropOffResponse =
  "Thank you for notifying CK staff of your meal drop off! We will send out an alert about this drop off to the people on our notification list.";

export default {
  SIGN_UP_WORDS,
  CANCEL_WORDS,
  INFO_WORD,
  signUpResponse,
  duplicateResponse,
  feedbackResponse,
  generalInfoResponse,
  dropOffResponse,
};
