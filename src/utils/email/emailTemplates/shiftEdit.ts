import moment from "moment";

import { sendEmail } from "../email";

const createShiftEditEmail = (shift: {
  date: string;
  fridge: string;
  cancel: boolean;
  mealCount: number;
  mealType: string;
}) => {
  const editIntro =
    "We're sending you this email to confirm that you edited your home chef shift. Here is your updated shift information:";
  const cancelIntro =
    "We're sending you this email to confirm that you canceled your home chef shift. This shift has been canceled:";
  const intro = shift.cancel ? cancelIntro : editIntro;

  return `
    <p>Hi Home Chef!</p>
    <p>This is Community Kitchens. ${intro}</p>
      <ul>
        <li>Date: ${moment(shift.date).format("dddd M/D/YY")}</li>
        <li>Fridge: ${shift.fridge}</li>
        <li>Number of Meals: ${shift.mealCount}</li>
                <li>Type of Meal: ${shift.mealType}</li>

      </ul>
      <p>To sign up for another shift, visit the <a href="https://portal.ckoakland.org/home-chef">Home Chef portal.</a></p>
    <p>Thanks!
    <br />
    Community Kitchens</p>
  `;
};

export const sendShiftEditEmail = async (
  email: string,
  shift: {
    date: string;
    cancel: boolean;
    mealCount: number;
    fridge: string;
    mealType: "Entree" | "Soup";
  }
) => {
  const html = createShiftEditEmail(shift);

  const action = shift.cancel ? "canceled" : "edited";

  const msg = {
    to: email,
    from: "kenai@ckoakland.org",
    subject: `You have ${action} a home chef shift`,
    html,
  };

  await sendEmail(msg);
};
