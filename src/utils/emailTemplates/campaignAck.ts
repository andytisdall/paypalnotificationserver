export default (firstName: string, lastName: string, amount: string) => {
  return `
    <body style="font-family: Calibri, sans-serif; font-size: 14px;">
      <p>Dear ${firstName},</p>
      <p>
        Thank you for donating to the Community Kitchens and Beyond Emancipation Meal Program Partnership. Your support allows us to provide warm meals that bring our community together, improve youth attendance, and address food insecurity
      </p>
      <p>Please see your receipt below.</p>
      <p>Donation amount: $${amount}</p>
      <p>In Community,</p>
      <p>
        Maria Alderete, Executive Director, Community Kitchens 
        <br>
        Vanetta Johnson, Executive Director, Beyond Emancipation
        </p>
      <p style="font-size: 12px;">Community is a 501(c)(3) nonprofit organization; our federal tax ID # is 85-1244770. Your donation is tax-
      deductible to the full extent provided by the law as no goods or services were exchanged nor provided in
      consideration of this gift and/or contribution.</p>
    </body>`;
};
