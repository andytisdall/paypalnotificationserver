export default (firstName: string, code: string) => {
  return `
      <p>Dear ${firstName},</p>
      <p>
        Click below to confirm your account.
      </p>
      <a href="portal.ckoakland.org/confirm-email/${code}" target="blank">Confirm</a>
      
`;
};
