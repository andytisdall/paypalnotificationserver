import { sendEmail } from "../email";

const sendMealsPlusFormSubmissionEmail = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  const html = `<p>Hi ${name},</p>
    <p>Thanks for submitting your info for our Meals Plus text alert program! We will review your information and potentially select one or more of your services to include on our schedule of text alerts</p>
    <p>If we include your service(s) in our announcement schedule, we reach out to let you know when your announcement(s) will go out and to verify that they contain the correct information. Please get in touch with me if you have any questions.</p>
    <p>Best,</p>
    <p>Andy Tisdall<br />
    Meals Plus Coordinator<br />
    andy@ckoakland.org<br />
    Community Kitchens<br />
    <a href="https://ckoakland.org">CKoakland.org</a></p>`;

  await sendEmail({
    to: email,
    from: "andy@ckoakland.org",
    html,
    subject: "Your Meals Plus form submission",
    bcc: "andy@ckoakland.org",
  });
};

export default sendMealsPlusFormSubmissionEmail;
