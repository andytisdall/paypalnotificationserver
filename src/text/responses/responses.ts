import { Region } from "@community-kitchens/apiinterfaces";
import { mealAlertResponses } from "./mealAlertResponses";

type ResponseType =
  | "generalInfoResponse"
  | "duplicateResponse"
  | "signUpResponse"
  | "feedbackResponse";

export const responses: Record<ResponseType, (region: Region) => string> = {
  generalInfoResponse: mealAlertResponses.generalInfoResponse,
  duplicateResponse: mealAlertResponses.duplicateResponse,
  signUpResponse: mealAlertResponses.signUpResponse,
  feedbackResponse: mealAlertResponses.feedbackResponse,
};
