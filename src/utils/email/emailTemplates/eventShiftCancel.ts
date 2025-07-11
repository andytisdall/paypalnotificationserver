import { format, utcToZonedTime } from "date-fns-tz";
import { sendEmail } from "../email";

const createEventShiftCancelEmail = (shift: {
  date: string;
  name?: string;
  event: string;
}) => {
  const intro = shift.name ? `Hello ${shift.name},` : "Hello,";

  return `
    <p>${intro}</p>
    <p>This is Community Kitchens. We're sending you this email to confirm that you canceled your CK event volunteer shift. This shift has been canceled:</p>
      <ul>
      <li>Event: ${shift.event}</li>
        <li>Date: ${format(
          utcToZonedTime(shift.date, "America/Los_Angeles"),
          "eeee M/d/yy"
        )}</li>
      </ul>
      <p>To sign up for a different time, <a href="https://portal.ckoakland.org">please sign into your portal</a>. Thank you for your commitment to providing all Oaklanders meals made with love and dignity.<p>

      <p>With Gratitude,</p>
      
      <p>Community Kitchens
      <br/>
      CKoakland.org</p>
      
  `;
};

export const sendEventShiftCancelEmail = async (
  email: string,
  shiftData: { date: string; name?: string; event: string }
) => {
  const html = createEventShiftCancelEmail(shiftData);

  const msg = {
    to: email,
    from: "kenai@ckoakland.org",
    subject: `You have canceled a CK event volunteer shift`,
    html,
  };

  await sendEmail(msg);
};
