const templates: Record<
  string,
  (firstName: string, lastName: string, amount: string) => string
> = {
  community_course: (firstName: string, lastName: string, amount: string) => {
    return `
    <body style="font-family: Calibri, sans-serif; font-size: 14px;">
    <p>Dear ${firstName} ${lastName},</p>
    <p>Thank you for your gift of $${amount} to Community Kitchens, and thank you for participating in Community Course. Your donation is being matched by the Oakland Roots Sports Club, and 100% of funds raised will support East Oakland Collective's August Feed The Hood event in conjunction with Digital Underground's 3rd annual Shock G Day. Your generousity is an acknowledgement of what a tremendous privilege it is to be able to eat from the kitchens of all our diverse and amazing Oakland Restaurant Week chefs, as well as an opportunity to make this event meaningful both for those who participate and those who cannot.</p>
    <p>Your support came at a critical time. Our meals are used to fill gaps left by other food support programs, to promote healthy lifestyles and connection to community, and to provide security and dignity for marginalized communities. Our meal
    programs support youth, low-income families and seniors and most importantly, our unhoused.</p>
    <p>Oakland has over 5,000 unhoused community members and while this population is growing,
    government support for meals has ended. Every day our unhoused residents are exposed to unsanitary
    and dangerous conditions and are vulnerable to serious health risks and significant safety hazards that
    threaten their lives. A warm meal is one way we can help.</p>
    <p><b>Your donation provides triple benefits:</b> keeping restaurants open, supporting local jobs and feeding our
    unhoused. Together we have provided over 200,000 meals to our community and over $2 million in
    revenue support for Oakland restaurants.</p>
    <p>Be assured our approach at Community Kitchens is rooted with core Oakland values and committed to
    food justice.</p>
    <ul>
      <li>Equitable and Inclusive - We have a strong focus on emerging neighborhoods, ensuring
      restaurant support for marginalized communities and business owners of color.</li>
  
      <li>Meals with Dignity - Our restaurants serve the same meals they serve their customers or family.
      Not everyone has the means for a delicious, freshly prepared hot meal. At Community Kitchens
      there’s a place at the table for everyone.</li>
  
      <li>Bridging our Community Efficiently – We partner our restaurants with community groups that
      have established networks and volunteers supporting our unhoused communities.</li>
    </ul>
    <br>
    <p>Thank you again for your generous contribution to our community.</p>
    <p>In solidarity,</p>
    <p>Maria Alderete
    <br>
    Community Kitchens
    <br>
    Executive Director &amp; Co-Founder</p>
    <br>
    <p style="font-size: 12px;">Community is a 501(c)(3) nonprofit organization; our federal tax ID # is 85-1244770. Your donation is tax-
    deductible to the full extent provided by the law as no goods or services were exchanged nor provided in
    consideration of this gift and/or contribution.</p>
    </body>`;
  },
};

export default templates;
