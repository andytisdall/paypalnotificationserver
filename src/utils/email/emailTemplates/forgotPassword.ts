import urls from "../../urls";
import { sendEmail } from "../email";

const createForgotPasswordEmail = (link: string, username: string) => {
  return `
    <p>Hello from Community Kitchens!</p>
    <p>Please follow this link to reset your password on the Community Kitchens portal.</p>
    <p><a href='${link}'>Reset Password</a></p>
    <p>Your username is: <strong>${username}</strong></p>
    <p>If you did not request to change your password, you can ignore this email.</p>
    <p>Community Kitchens</p>
  `;
};

export const sendForgotPasswordEmail = async (
  email: string,
  link: string,
  username: string
) => {
  const html = createForgotPasswordEmail(link, username);

  const msg = {
    to: email,
    from: urls.adminEmail,
    subject: "CK Portal: Your link to create a new password",
    html,
  };

  await sendEmail(msg);
};
