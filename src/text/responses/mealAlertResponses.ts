import { MEAL_SURVEY_URL, CANCEL_WORDS, SIGN_UP_WORDS } from "./keywords";
import { Region, regionKey } from "../types";

const signUpResponse = (region: Region) => {
  return `Thank you for signing up for ${regionKey[region]} meal notifications! For help, reply "info". To opt-out, reply "stop". If you are able to complete our short survey, we won't share your data and it helps greatly with funding to provide free meals to the people: ${MEAL_SURVEY_URL}`;
};

const duplicateResponse = (region: Region) => {
  return `Your phone number is already on the list for ${regionKey[region]} meal notifications.`;
};

const feedbackResponse = () => {
  return `Thank you for your feedback. A team member will review your message soon. If you are able to complete our short survey, we won't share your data and it helps greatly with funding to provide free meals to the people: ${MEAL_SURVEY_URL}`;
};

const generalInfoResponse = (region: Region) => {
  return `This is the Community Kitchens text service for ${regionKey[region]} meal notifications. Send the word "${SIGN_UP_WORDS[0]}" to sign up for alerts. Send the word "${CANCEL_WORDS[0]}" to stop receiving texts from this number.`;
};

export const mealAlertResponses = {
  signUpResponse,
  duplicateResponse,
  feedbackResponse,
  generalInfoResponse,
};
