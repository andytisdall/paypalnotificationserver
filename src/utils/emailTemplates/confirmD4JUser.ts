export default (name: string, code: string) => {
  return `
      <p>Dear ${name},</p>
      <p>
        You have created an account on the Community Kitchens Dining for Justice app! Click below to confirm your account.
      </p>
      <a href="https://portal.ckoakland.org/d4japp/account/confirm/${code}" target="blank"><strong>Confirm Now</strong></a>
      <br />
      <img src="https://storage.googleapis.com/coherent-vision-368820.appspot.com/CKLogo.png" width=200 style="margin-top: 20px;" />
`;
};
