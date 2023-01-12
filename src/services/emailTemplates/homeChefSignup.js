module.exports = (info) => {
  return `
  <body style="font-family: Calibri, sans-serif; font-size: 14px;">
  <p>Dear ${info.firstName} ${info.lastName},</p>
  <p>Thank you for signing up for Home Chef!</p>
  <p>Sincerely, Community Kitchens</p>
  `;
};
