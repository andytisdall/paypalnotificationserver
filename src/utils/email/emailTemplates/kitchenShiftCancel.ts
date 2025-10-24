import moment from "moment";

import { sendEmail } from "../email";

const createShiftCancelEmail = (shift: {
  date: string;
  name?: string;
  job: string;
  campaign: string;
}) => {
  const intro = shift.name ? `Hello ${shift.name},` : "Hello,";

  return `
    <p>${intro}</p>
    <p>This is Community Kitchens. We're sending you this email to confirm that you canceled your CK volunteer shift. This shift has been canceled:</p>
      <ul>
        <li><strong>Volunteer program:</strong> ${shift.campaign}
        <li><strong>Job:</strong> ${shift.job}
        <li><strong>Date:</strong> ${moment(shift.date).format(
          "dddd M/D/yy"
        )}</li>
      </ul>
      <p>To sign up for a different time, please sign into the <a href="https://portal.ckoakland.org/volunteers">CK Volunteer Portal</a>. Thank you for your commitment to providing all Oaklanders meals made with love and dignity.<p>

      <p>With gratitude,
      <br />
      Community Kitchens
      <br/>
      CKoakland.org</p>
      
  `;
};

export const sendShiftCancelEmail = async (
  email: string,
  shiftData: { date: string; name?: string; job: string; campaign: string }
) => {
  const html = createShiftCancelEmail(shiftData);

  const msg = {
    to: email,
    from: "volunteers@ckoakland.org",
    subject: `You have canceled a CK volunteer shift`,
    html,
  };

  await sendEmail(msg);
};
