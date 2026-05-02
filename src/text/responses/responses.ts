import { Region } from "../types";
import { mealAlertResponses } from "./mealAlertResponses";
import { mealsPlusResponses } from "./mealsPlusResponses";

type ResponseType =
  | "generalInfoResponse"
  | "duplicateResponse"
  | "signUpResponse"
  | "feedbackResponse";

export const responses: Record<
  ResponseType,
  { ALERT: (region: Region) => string; PLUS: () => string }
> = {
  generalInfoResponse: {
    ALERT: mealAlertResponses.generalInfoResponse,
    PLUS: mealsPlusResponses.generalInfoResponse,
  },
  duplicateResponse: {
    ALERT: mealAlertResponses.duplicateResponse,
    PLUS: mealsPlusResponses.duplicateResponse,
  },
  signUpResponse: {
    ALERT: mealAlertResponses.signUpResponse,
    PLUS: mealsPlusResponses.signUpResponse,
  },
  feedbackResponse: {
    ALERT: mealAlertResponses.feedbackResponse,
    PLUS: mealsPlusResponses.feedbackResponse,
  },
};
