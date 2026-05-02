import { MEAL_SURVEY_URL, SIGN_UP_WORDS, CANCEL_WORDS } from "./keywords";

const signUpResponse = () =>
  `Thank you for signing up for meals plus notifications! For help, reply "help". To opt-out, reply "stop". If you are able to complete our short survey, we won't share your data and it helps greatly with funding to provide free meals to the people: ${MEAL_SURVEY_URL}`;

const duplicateResponse = () =>
  "Your phone number is already on the list for meals plus notifications.";

const feedbackResponse = () =>
  `Thank you for your feedback. A team member will review your message soon. If you are able to complete our short survey, we won't share your data and it helps greatly with funding to provide free meals to the people: ${MEAL_SURVEY_URL}`;

const generalInfoResponse = () =>
  `This is the Community Kitchens text service for meals plus notifications. Send the word "${SIGN_UP_WORDS[0]}" to sign up for alerts. Send the word "${CANCEL_WORDS[0]}" to stop receiving texts from this number.`;

export const mealsPlusResponses = {
  signUpResponse,
  duplicateResponse,
  feedbackResponse,
  generalInfoResponse,
};
