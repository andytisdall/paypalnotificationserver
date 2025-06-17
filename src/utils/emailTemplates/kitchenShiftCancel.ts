import moment from "moment";

export default (shift: {
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
        <li>Volunteer program: ${shift.campaign}
        <li>Job: ${shift.job}
        <li>Date: ${moment(shift.date).format("dddd M/D/yy")}</li>
      </ul>
      <p>To sign up for a different time, <a href="https://portal.ckoakland.org">please sign into your portal</a>. Thank you for your commitment to providing all Oaklanders meals made with love and dignity.<p>

      <p>With Gratitude,</p>
      
      <p>Community Kitchens
      <br/>
      CKoakland.org</p>
      
  `;
};
