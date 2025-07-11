import urls from "../../urls";
import { sendEmail } from "../email";

const createDonationAckEmail = (
  firstName: string,
  lastName: string,
  amount: string
) => {
  return `
  <p>Dear&nbsp;${firstName} ${lastName},</p>
  <p>Thank you for your gift of&nbsp;$${amount} to Community Kitchens. Your support came at a critical time. Our meals are used to fill gaps left by other food support programs, to promote healthy lifestyles and connection to community, and to provide security and dignity for marginalized communities. Our meal programs support youth, low-income families and seniors and most importantly, our unhoused.</p>
  <p>Food insecurity is a growing public health issue in our community. Oakland has over 5,000 unhoused community members and while this population is growing, government support for meals has ended. Every day our unhoused residents are exposed to unsanitary and dangerous conditions and are vulnerable to serious health risks and significant safety hazards that threaten their lives. <strong>A warm meal is one way we can help.</strong></p>
  <p>With your gift, Community Kitchens is positioned to make real impact in reducing hunger and homelessness in our community. Our new food hub, street meal outreach, mobile grocery distribution, pediatric pantry initiative and culinary workforce development programs help stop the cycle of intergenerational poverty in a sustainable and innovative way.</p>
  <p>Thank you again for your generous contribution to our community.</p>
  <p>In solidarity,</p>
  <p>Maria Alderete
  <br>
  Community Kitchens
  <br>
  Executive Director &amp; Co-Founder</p>
  <p style="font-size: 12px;">Community is a 501(c)(3) nonprofit organization; our federal tax ID # is 85-1244770. Your donation is tax-deductible to the full extent provided by the law as no goods or services were exchanged nor provided in consideration of this gift and/or contribution.</p>
`;
};

const createCampaignAckEmail = (
  firstName: string,
  lastName: string,
  amount: string
) => {
  return `
      <p>Dear ${firstName},</p>
      <p>
        Thank you for donating to the Community Kitchens and Beyond Emancipation Meal Program Partnership. Your support allows us to provide warm meals that bring our community together, improve youth attendance, and address food insecurity.
      </p>
      <p>Please see your receipt below.</p>
      <p>Donation amount: $${amount}</p>
      <p>In Community,</p>
      <p>
        Maria Alderete, Executive Director, Community Kitchens 
        <br>
        Vanetta Johnson, Executive Director, Beyond Emancipation
        </p>
      <a href="https://www.facebook.com/ckoakland/"><img style="width: 20px; height: 20px; padding-right: 10px;" src="https://storage.googleapis.com/coherent-vision-368820.appspot.com/facebook.png" alt="Facebook" /></a><a href="https://www.linkedin.com/company/community-kitchens-oakland"><img style="width: 20px; height: 20px; padding-right: 10px;" src="https://storage.googleapis.com/coherent-vision-368820.appspot.com/linkedin.png" alt="LinkedIn" /></a><a href="https://www.instagram.com/ckoakland/"><img style="width: 20px; height: 20px; padding-right: 10px;" src="https://storage.googleapis.com/coherent-vision-368820.appspot.com/instagram.png" alt="Instagram" /></a>
      <p style="font-size: 12px;">
        Community is a 501(c)(3) nonprofit organization; our federal tax ID # is 85-1244770. Your donation is tax-deductible to the full extent provided by the law as no goods or services were exchanged nor provided in consideration of this gift and/or contribution.
      </p>
`;
};

export const sendDonationAckEmail = async (donationData: {
  first_name: string;
  last_name: string;
  payment_gross: string;
  payer_email: string;
  custom?: string;
}) => {
  let html;
  if (donationData.custom) {
    html = createCampaignAckEmail(
      donationData.first_name,
      donationData.last_name,
      donationData.payment_gross
    );
  } else {
    html = createDonationAckEmail(
      donationData.first_name,
      donationData.last_name,
      donationData.payment_gross
    );
  }

  const msg = {
    to: donationData.payer_email,
    from: urls.adminEmail,
    subject: "Thank you for your donation!",
    html,
  };

  await sendEmail(msg);
};
