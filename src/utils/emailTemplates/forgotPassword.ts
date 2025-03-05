export default (link: string, username: string) => {
  return `
    <p>Hello from Community Kitchens!</p>
    <p>Please follow this link to reset your password on the Community Kitchens portal.</p>
    <p><a href='${link}'>Reset Password</a></p>
    <p>Your username is: <strong>${username}</strong></p>
    <p>If you did not request to change your password, you can ignore this email.</p>
    <p>Community Kitchens</p>
  `;
};
